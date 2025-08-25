// src/server.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();
// Initialize server with better logging
const server = Fastify({
    logger: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport: process.env.NODE_ENV === 'development' ? {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
            }
        } : undefined
    }
});
const prisma = new PrismaClient();
const SALT_ROUNDS = 10;
// Add this at the top of your server.ts file, with other variables
let aiApiCallCount = 0;
const AI_API_CALL_LIMIT = 10; // Our own internal monthly limit
// Enhanced CORS configuration
// World-Class Plugin Registration
const allowedOrigins = [
    'http://localhost:3000',
    'https://surecart-monorepo.vercel.app', // your deployed frontend
];
// register cors normally but DO NOT register extra server.options('*')
server.register(cors, {
    origin: (origin, cb) => {
        if (!origin)
            return cb(null, true);
        if (allowedOrigins.includes(origin))
            return cb(null, true);
        cb(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
});
// globally intercept OPTIONS before routing
server.addHook('onRequest', async (request, reply) => {
    if (request.method === 'OPTIONS') {
        reply
            .header('Access-Control-Allow-Origin', request.headers.origin || '*')
            .header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            .header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            .status(204)
            .send();
        // return here — Fastify will not continue routing after send()
    }
});
// --- HEALTH CHECK ROUTE ---
server.get('/health', async (request, reply) => {
    try {
        // Test database connection
        await prisma.$queryRaw `SELECT 1`;
        return {
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString()
        };
    }
    catch (error) {
        server.log.error('Database health check failed:', error);
        reply.status(500).send({
            status: 'error',
            database: 'disconnected',
            timestamp: new Date().toISOString()
        });
    }
});
// GET /search?q=...
// server.ts (or routes/search.ts) — Fastify route
// Make sure `prisma` is your PrismaClient instance.
server.get('/search', async (request, reply) => {
    const q = String(request.query.q || '').trim();
    const limit = Math.min(50, Number(request.query.limit || 10));
    const page = Math.max(1, Number(request.query.page || 1));
    const offset = (page - 1) * limit;
    const suggest = String(request.query.suggest || '0') === '1';
    if (!q) {
        return reply.code(400).send({ message: 'Search query is required.' });
    }
    try {
        // Use full-text search for queries length >= 3
        if (q.length >= 3) {
            const creators = await prisma.$queryRaw `
          SELECT u.id, u.username, u.profileImageUrl,
            ts_rank_cd(to_tsvector('english', COALESCE(u.username, '')), plainto_tsquery('english', ${q})) as rank
          FROM "User" u
          WHERE to_tsvector('english', COALESCE(u.username, '')) @@ plainto_tsquery('english', ${q})
          ORDER BY rank DESC NULLS LAST
          LIMIT ${limit} OFFSET ${offset}
        `;
            const collections = await prisma.$queryRaw `
          SELECT c.id, c.name, c.slug, c."coverImageUrl", u.username as "ownerUsername",
            ts_rank_cd(to_tsvector('english', COALESCE(c.name, '')), plainto_tsquery('english', ${q})) as rank
          FROM "Collection" c
          JOIN "User" u ON u.id = c."userId"
          WHERE to_tsvector('english', COALESCE(c.name, '')) @@ plainto_tsquery('english', ${q})
          ORDER BY rank DESC NULLS LAST
          LIMIT ${limit} OFFSET ${offset}
        `;
            const products = await prisma.$queryRaw `
          SELECT p.id, p.name, p.description, p."imageUrls", b.name as "brandName",
            ts_rank_cd(to_tsvector('english', COALESCE(p.name, '') || ' ' || COALESCE(p.description, '')), plainto_tsquery('english', ${q})) as rank
          FROM "Product" p
          LEFT JOIN "Brand" b ON b.id = p."brandId"
          WHERE to_tsvector('english', COALESCE(p.name, '') || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', ${q})
          ORDER BY rank DESC NULLS LAST
          LIMIT ${limit} OFFSET ${offset}
        `;
            return reply.send({ creators, collections, products, page, limit });
        }
        else {
            // Fuzzy fallback for short queries or partial matches (uses trigram / ILIKE)
            const creators = await prisma.$queryRaw `
          SELECT u.id, u.username, u.profileImageUrl,
            similarity(u.username, ${q}) AS sim
          FROM "User" u
          WHERE u.username ILIKE ${'%' + q + '%'} OR similarity(u.username, ${q}) > 0.15
          ORDER BY sim DESC NULLS LAST
          LIMIT ${limit} OFFSET ${offset}
        `;
            const collections = await prisma.$queryRaw `
          SELECT c.id, c.name, c.slug, c."coverImageUrl", u.username as "ownerUsername",
            GREATEST(similarity(c.name, ${q}), 0) as sim
          FROM "Collection" c
          JOIN "User" u ON u.id = c."userId"
          WHERE c.name ILIKE ${'%' + q + '%'} OR similarity(c.name, ${q}) > 0.15
          ORDER BY sim DESC NULLS LAST
          LIMIT ${limit} OFFSET ${offset}
        `;
            const products = await prisma.$queryRaw `
          SELECT p.id, p.name, p.description, p."imageUrls", b.name as "brandName",
            GREATEST(similarity(p.name, ${q}), 0) as sim
          FROM "Product" p
          LEFT JOIN "Brand" b ON b.id = p."brandId"
          WHERE p.name ILIKE ${'%' + q + '%'} OR similarity(p.name, ${q}) > 0.15
          ORDER BY sim DESC NULLS LAST
          LIMIT ${limit} OFFSET ${offset}
        `;
            return reply.send({ creators, collections, products, page, limit });
        }
    }
    catch (err) {
        server.log.error('Search error:', err);
        return reply.code(500).send({ message: 'Error performing search' });
    }
});
server.get('/dashboard/:userId/analytics', async (request, reply) => {
    const { userId } = request.params;
    try {
        // --- 1. Fetch Real Data ---
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const clicksByDay = await prisma.click.groupBy({
            by: ['createdAt'],
            where: { collection: { userId: userId }, createdAt: { gte: sevenDaysAgo } },
            _count: { id: true },
            orderBy: { createdAt: 'asc' }
        });
        const collections = await prisma.collection.findMany({
            where: { userId },
            include: { _count: { select: { products: true, clicks: true, likedBy: true } } },
        });
        const totalImpressions = await prisma.collectionView.count({
            where: {
                collection: {
                    userId: userId,
                },
            },
        });
        const creator = await prisma.user.findUnique({
            where: { id: userId },
            include: { _count: { select: { followers: true } } }
        });
        // --- 2. Aggregate Real Data by Day ---
        const clicksByDayRaw = await prisma.click.groupBy({ by: ['createdAt'], where: { collection: { userId }, createdAt: { gte: sevenDaysAgo } }, _count: { _all: true } });
        const likesByDayRaw = await prisma.userLikes.groupBy({ by: ['createdAt'], where: { collection: { userId }, createdAt: { gte: sevenDaysAgo } }, _count: { _all: true } });
        // --- 3. Process Data for Time-Series Chart ---
        const dateMap = new Map();
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            dateMap.set(key, { Clicks: 0, Likes: 0, Engagements: 0 });
        }
        clicksByDayRaw.forEach(row => {
            const key = new Date(row.createdAt).toISOString().split('T')[0];
            if (dateMap.has(key))
                dateMap.get(key).Clicks += row._count._all;
        });
        likesByDayRaw.forEach(row => {
            const key = new Date(row.createdAt).toISOString().split('T')[0];
            if (dateMap.has(key))
                dateMap.get(key).Likes += row._count._all;
        });
        dateMap.forEach(value => value.Engagements = value.Clicks + value.Likes);
        const performanceOverTime = Array.from(dateMap.entries()).map(([date, metrics]) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            ...metrics
        }));
        // --- 4. Calculate Summary and Top Collections ---
        const totalClicks = collections.reduce((sum, col) => sum + col._count.clicks, 0);
        const totalLikes = collections.reduce((sum, col) => sum + col._count.likedBy, 0);
        const topCollections = collections.map(c => ({
            id: c.id, name: c.name, clicks: c._count.clicks, likes: c._count.likedBy,
            shares: Math.floor(c._count.clicks / 10 + c._count.likedBy * 2),
        })).sort((a, b) => b.clicks - a.clicks).slice(0, 5);
        // --- 5. Send Final Payload ---
        reply.send({
            summary: {
                totalAudience: totalImpressions, engagements: totalClicks + totalLikes,
                outboundClicks: totalClicks, saves: totalLikes, totalLikes: totalLikes,
                followers: creator?._count.followers || 0,
            },
            performanceOverTime: performanceOverTime,
            topCollections: topCollections,
        });
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error fetching analytics data" });
    }
});
// --- MOCK DATA FOR PRODUCT SEARCH ---
const mockProducts = [
    { id: 'prod_serum', name: 'Niacinamide 10% + Zinc 1%', imageUrl: 'https://placehold.co/600x800/E0E7FF/4F46E5?text=Serum', brand: 'The Ordinary', baseUrl: 'https://example.com/product1' },
    { id: 'prod_cleanser', name: 'Hydrating Facial Cleanser', imageUrl: 'https://placehold.co/600x600/DBEAFE/1E40AF?text=Cleanser', brand: 'CeraVe', baseUrl: 'https://example.com/product2' },
    { id: 'prod_sunscreen', name: 'Unseen Sunscreen SPF 40', imageUrl: 'https://placehold.co/600x700/FEF3C7/92400E?text=Sunscreen', brand: 'Supergoop!', baseUrl: 'https://example.com/product3' },
    { id: 'prod_lipmask', name: 'Lip Sleeping Mask', imageUrl: 'https://placehold.co/600x600/FCE7F3/9D174D?text=Lip+Mask', brand: 'Laneige', baseUrl: 'https://example.com/product4' },
    { id: 'prod_cream', name: 'Protini Polypeptide Cream', imageUrl: 'https://placehold.co/600x750/F0F9FF/0891B2?text=Cream', brand: 'Drunk Elephant', baseUrl: 'https://example.com/product5' },
];
// --- AUTHENTICATION ROUTES ---
server.post('/register', async (request, reply) => {
    const { email, password, username, role = 'CREATOR' } = request.body;
    if (!email || !password || !username)
        return reply.code(400).send({ message: 'All fields are required.' });
    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = await prisma.user.create({ data: { email, username, authProviderId: hashedPassword, role } });
        const { authProviderId, ...userResponse } = newUser;
        reply.code(201).send(userResponse);
    }
    catch (error) {
        if (error.code === 'P2002')
            reply.code(409).send({ message: 'User already exists.' });
        else {
            server.log.error(error);
            reply.code(500).send({ message: 'Server error.' });
        }
    }
});
server.post('/login', async (request, reply) => {
    const { email, password } = request.body;
    if (!email || !password)
        return reply.code(400).send({ message: 'Email and password are required.' });
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
            return reply.code(401).send({ message: 'Invalid credentials.' });
        const match = await bcrypt.compare(password, user.authProviderId);
        if (!match)
            return reply.code(401).send({ message: 'Invalid credentials.' });
        const { authProviderId, ...userResponse } = user;
        reply.send(userResponse);
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: 'Server error.' });
    }
});
// POST /auth/social
server.post('/auth/social', async (request, reply) => {
    const { email, username, authProviderId, profileImageUrl } = request.body;
    if (!email || !authProviderId || !username) {
        return reply.code(400).send({ message: "Email, username, and authProviderId are required." });
    }
    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: { authProviderId }, // Update auth provider ID if user exists
            create: {
                email,
                username,
                authProviderId,
                profileImageUrl,
                role: 'SHOPPER', // New social signups default to Shopper
            },
        });
        const { authProviderId: _, ...userResponse } = user;
        reply.send(userResponse);
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: 'An internal server error occurred.' });
    }
});
server.put('/users/:userId/upgrade-to-creator', async (request, reply) => {
    const { userId } = request.params;
    const { fullName, phone, instagramHandle, profileImageUrl } = request.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                role: 'CREATOR',
                fullName,
                phone,
                instagramHandle,
                profileImageUrl,
            },
        });
        const { authProviderId, ...userResponse } = updatedUser;
        reply.send(userResponse);
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Could not upgrade user to creator." });
    }
});
// POST /brands/register
server.post('/brands/register', async (request, reply) => {
    const { brandName, category, presence, website, email, name } = request.body;
    try {
        // In a real app, we would create a temporary "BrandApplication" model.
        // For the MVP, we can create a placeholder user and brand.
        const placeholderEmail = `brand-${Date.now()}@surecart-pending.dev`;
        const hashedPassword = await bcrypt.hash(`temp_password_${Date.now()}`, 10);
        const brandUser = await prisma.user.create({
            data: {
                email: placeholderEmail,
                username: brandName.toLowerCase().replace(/\s+/g, ''),
                authProviderId: hashedPassword,
                role: 'BRAND',
                fullName: name,
            }
        });
        await prisma.brand.create({
            data: {
                name: brandName,
                websiteUrl: website,
                userId: brandUser.id,
                // You can add category and presence to your schema if needed
            }
        });
        // In a real app, you would trigger a confirmation email here.
        // e.g., await sendBrandConfirmationEmail({ brandName, email, name });
        reply.code(201).send({ message: 'Brand application submitted successfully.' });
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: 'An error occurred while submitting the application.' });
    }
});
// --- SHOPPER ENGAGEMENT ROUTES ---
server.post('/collections/:collectionId/like', async (request, reply) => {
    const { collectionId } = request.params;
    const { userId } = request.body;
    if (!userId)
        return reply.code(400).send({ message: "User ID is required." });
    try {
        await prisma.userLikes.create({ data: { userId, collectionId } });
        reply.code(201).send({ isLiked: true });
    }
    catch (error) {
        if (error.code === 'P2002')
            return reply.code(409).send({ message: "Already liked" });
        server.log.error(error);
        reply.code(500).send({ message: "Server error" });
    }
});
server.delete('/collections/:collectionId/unlike', async (request, reply) => {
    const { collectionId } = request.params;
    const { userId } = request.body;
    if (!userId)
        return reply.code(400).send({ message: "User ID is required." });
    try {
        await prisma.userLikes.delete({ where: { userId_collectionId: { userId, collectionId } } });
        reply.code(200).send({ isLiked: false });
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Could not unlike collection" });
    }
});
// --- FOLLOW / UNFOLLOW ROUTES ---
server.post('/users/:creatorId/follow', async (request, reply) => {
    const { creatorId } = request.params;
    const { userId } = request.body; // The user who is doing the following
    if (!userId)
        return reply.code(400).send({ message: "User ID is required." });
    try {
        await prisma.follow.create({
            data: {
                followerId: userId,
                followingId: creatorId
            }
        });
        reply.code(201).send({ message: 'Followed successfully' });
    }
    catch (error) {
        if (error.code === 'P2002') { // Handles cases where the user already follows the creator
            return reply.code(409).send({ message: 'Already following' });
        }
        server.log.error(error);
        reply.code(500).send({ message: 'Error following user' });
    }
});
server.delete('/users/:creatorId/unfollow', async (request, reply) => {
    const { creatorId } = request.params;
    const { userId } = request.body;
    if (!userId)
        return reply.code(400).send({ message: "User ID is required." });
    try {
        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: creatorId,
                },
            },
        });
        reply.code(204).send();
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Could not unfollow user." });
    }
});
server.get('/users/:userId/follow-status/:creatorId', async (request, reply) => {
    const { userId, creatorId } = request.params;
    try {
        const follow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: creatorId
                }
            }
        });
        reply.send({ isFollowing: !!follow });
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error fetching follow status" });
    }
});
server.post('/collections/:collectionId/comments', async (request, reply) => {
    const { collectionId } = request.params;
    const { userId, text } = request.body;
    try {
        const comment = await prisma.comment.create({
            data: { text, userId, collectionId },
            include: { user: { select: { username: true, profileImageUrl: true } } }
        });
        reply.code(201).send(comment);
    }
    catch (error) {
        reply.code(500).send({ message: 'Error posting comment' });
    }
});
server.get('/users/:userId/liked-status/:collectionId', async (request, reply) => {
    const { userId, collectionId } = request.params;
    try {
        const like = await prisma.userLikes.findUnique({ where: { userId_collectionId: { userId, collectionId } } });
        reply.send({ isLiked: !!like });
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error fetching like status" });
    }
});
server.get('/users/:userId/likes', async (request, reply) => {
    const { userId } = request.params;
    try {
        const likedCollections = await prisma.userLikes.findMany({
            where: { userId },
            include: {
                collection: {
                    include: {
                        user: true,
                        products: {
                            take: 1,
                            orderBy: { displayOrder: 'asc' },
                            include: { product: true }
                        }
                    }
                }
            }
        });
        const response = likedCollections.map(like => ({
            id: like.collection.id,
            name: like.collection.name,
            slug: like.collection.slug,
            author: like.collection.user.username,
            authorAvatar: like.collection.user.profileImageUrl || `https://placehold.co/100x100/E2E8F0/475569?text=${like.collection.user.username.charAt(0).toUpperCase()}`,
            coverImage: like.collection.products[0]?.product.imageUrls[0] || `https://placehold.co/400x300/cccccc/333333?text=${encodeURIComponent(like.collection.name)}`
        }));
        reply.send(response);
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error fetching liked collections" });
    }
});
// GET /collections/:collectionId/comments
server.get('/collections/:collectionId/comments', async (request, reply) => {
    const { collectionId } = request.params;
    try {
        const comments = await prisma.comment.findMany({
            where: { collectionId },
            orderBy: { createdAt: 'asc' },
            include: { user: { select: { username: true, profileImageUrl: true } } }
        });
        reply.send(comments);
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error fetching comments" });
    }
});
// POST /products/ask-ai
server.post('/products/ask-ai', async (request, reply) => {
    const { productName } = request.body;
    if (!process.env.GEMINI_API_KEY) {
        server.log.error('GEMINI_API_KEY is not configured.');
        return reply.code(500).send({ message: "AI service is not configured." });
    }
    if (aiApiCallCount >= AI_API_CALL_LIMIT) {
        return reply.code(429).send({ message: "This feature is temporarily unavailable due to high demand. Please try again later." });
    }
    // This is a critical check for production
    if (!process.env.GEMINI_API_KEY) {
        return reply.code(500).send({ message: "AI service is not configured." });
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a helpful e-commerce assistant. Your goal is to provide a balanced and concise summary of public reviews for a product. Based on common knowledge and reviews for the product "${productName}", provide a summary with:
- Three bullet points for "Pros" (what people love).
- Three bullet points for "Cons" (common complaints or drawbacks).
- A one-sentence "Best For" recommendation.
Keep the language neutral and objective.`;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Increment our counter after a successful call
        aiApiCallCount++;
        reply.send({ summary: text });
    }
    catch (error) {
        server.log.error(error, "Error fetching AI summary");
        reply.code(500).send({ message: "Could not generate AI summary." });
    }
});
// --- CREATOR DASHBOARD & COLLECTION MANAGEMENT ---
server.get('/dashboard/:userId', async (request, reply) => {
    const { userId } = request.params;
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return reply.code(404).send({ message: "User not found" });
        const collections = await prisma.collection.findMany({
            where: { userId },
            include: { _count: { select: { products: true, likedBy: true } } }
        });
        const responseData = collections.map(c => ({
            id: c.id, name: c.name, slug: c.slug,
            productsCount: c._count.products,
            likes: c._count.likedBy,
            shares: Math.floor(Math.random() * 100), // Simulated for now
            username: user.username,
        }));
        reply.send({ collections: responseData });
    }
    catch (error) {
        reply.code(500).send({ message: "Error fetching dashboard data" });
    }
});
server.get('/collections/:id', async (request, reply) => {
    const { id } = request.params;
    try {
        const collection = await prisma.collection.findUnique({
            where: { id },
            include: { products: { orderBy: { displayOrder: 'asc' }, include: { product: { include: { brand: true } } } } }
        });
        if (!collection)
            return reply.code(404).send({ message: "Collection not found" });
        const response = {
            id: collection.id, name: collection.name,
            products: collection.products.map(cp => ({ id: cp.product.id, name: cp.product.name, imageUrl: cp.product.imageUrls[0], brand: cp.product.brand?.name || "Brand" }))
        };
        reply.send(response);
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error fetching collection details" });
    }
});
server.post('/collections', async (request, reply) => {
    let { name, products, userId, description, coverImageUrl } = request.body;
    try {
        // --- VALIDATION STEP ---
        const productIds = products.map((p) => p.id);
        const existingProductsCount = await prisma.product.count({
            where: { id: { in: productIds } },
        });
        if (existingProductsCount !== productIds.length) {
            return reply.code(400).send({ message: "One or more selected products do not exist. Please refresh and try again." });
        }
        // --- END VALIDATION ---
        if (!coverImageUrl && products && products.length > 0) {
            const firstProduct = await prisma.product.findUnique({ where: { id: products[0].id } });
            if (firstProduct)
                coverImageUrl = firstProduct.imageUrls[0];
        }
        const newCollection = await prisma.collection.create({
            data: {
                name, slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                userId, description, coverImageUrl,
                products: { create: products.map((p, index) => ({ productId: p.id, displayOrder: index })) },
            },
        });
        reply.code(201).send(newCollection);
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error creating collection" });
    }
});
server.delete('/collections/:id', async (request, reply) => {
    const { id } = request.params;
    try {
        await prisma.collectionProduct.deleteMany({ where: { collectionId: id } });
        await prisma.click.deleteMany({ where: { collectionId: id } });
        await prisma.userLikes.deleteMany({ where: { collectionId: id } });
        await prisma.collection.delete({ where: { id } });
        reply.code(204).send();
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error deleting collection" });
    }
});
// PUT /collections/:id
server.put('/collections/:id', async (request, reply) => {
    const { id } = request.params;
    const { name, products } = request.body; // Add description, coverImageUrl etc. as needed
    try {
        // First, delete existing product connections for this collection
        await prisma.collectionProduct.deleteMany({
            where: { collectionId: id },
        });
        // Then, update the collection and create the new product connections
        const updatedCollection = await prisma.collection.update({
            where: { id },
            data: {
                name,
                slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                products: {
                    create: products.map((p, index) => ({
                        productId: p.id,
                        displayOrder: index,
                    })),
                },
            },
        });
        reply.send(updatedCollection);
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error updating collection" });
    }
});
// GET /brands/:brandId/dashboard
server.get('/brands/:brandId/dashboard', async (request, reply) => {
    const { brandId } = request.params;
    try {
        // Find all collections that feature this brand's products
        const collectionsWithBrandProducts = await prisma.collection.findMany({
            where: {
                products: { some: { product: { brandId: brandId } } }
            },
            include: {
                user: true, // The creator of the collection
                _count: { select: { clicks: true } }
            }
        });
        const totalClicks = collectionsWithBrandProducts.reduce((sum, col) => sum + col._count.clicks, 0);
        const topCreators = collectionsWithBrandProducts.map(col => ({
            id: col.user.id,
            username: col.user.username,
            profileImageUrl: col.user.profileImageUrl,
            collectionName: col.name,
            clicks: col._count.clicks,
        })).sort((a, b) => b.clicks - a.clicks).slice(0, 5); // Top 5
        reply.send({
            summary: {
                totalClicks,
                totalCollections: collectionsWithBrandProducts.length,
                topCreator: topCreators[0] || null
            },
            topCreators
        });
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error fetching brand dashboard" });
    }
});
// GET /users/:userId/rewards
// GET /users/:userId/rewards
server.get('/users/:userId/rewards', async (request, reply) => {
    const { userId } = request.params;
    try {
        const coupons = await prisma.coupon.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        // Calculate the wallet balance from approved transactions
        const balance = transactions
            .filter(t => t.status === 'APPROVED')
            .reduce((sum, t) => sum + t.amount, 0);
        const wallet = {
            balance: balance,
            currency: 'INR'
        };
        reply.send({ wallet, coupons, transactions });
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error fetching rewards" });
    }
});
// --- PUBLIC & UNIVERSAL ROUTES ---
server.get('/products/search', async (request, reply) => {
    const { q, brandId } = request.query;
    try {
        const products = await prisma.product.findMany({
            where: {
                name: {
                    contains: q || '',
                    mode: 'insensitive',
                },
                // This is the FIX: Only add brandId to the query if it exists
                ...(brandId && { brandId: brandId })
            },
            include: { brand: true },
        });
        const response = products.map(p => ({
            id: p.id,
            name: p.name,
            // This is the FIX: Safely access the brand name
            brand: p.brand?.name || 'Unknown Brand',
            imageUrl: p.imageUrls[0],
        }));
        return response;
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error searching products" });
    }
});
// POST /public/collections/:collectionId/view
server.post('/public/collections/:collectionId/view', async (request, reply) => {
    const { collectionId } = request.params;
    const { userId } = request.body; // userId is optional
    try {
        await prisma.collectionView.create({
            data: {
                collectionId,
                userId: userId || null, // Handle anonymous views
            }
        });
        reply.code(201).send({ message: "View logged successfully." });
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error logging view" });
    }
});
// GET /brands
server.get('/brands', async (request, reply) => {
    try {
        const brands = await prisma.brand.findMany({
            orderBy: { name: 'asc' }
        });
        reply.send(brands);
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error fetching brands" });
    }
});
// NEW: This powers the Pinterest-style infinite feed on the homepage
server.get('/public/home', async (request, reply) => {
    try {
        const collections = await prisma.collection.findMany({
            take: 50, // A reasonable limit for the initial feed
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { username: true, profileImageUrl: true } },
                products: { take: 1, orderBy: { displayOrder: 'asc' }, include: { product: { select: { imageUrls: true } } } }
            }
        });
        const response = collections.map(c => ({
            id: c.id, name: c.name, slug: c.slug, author: c.user.username,
            authorAvatar: c.user.profileImageUrl || `https://placehold.co/100x100/E2E8F0/475569?text=${c.user.username.charAt(0).toUpperCase()}`,
            coverImage: c.coverImageUrl || c.products[0]?.product.imageUrls[0] || `https://placehold.co/400x300/cccccc/333333?text=${encodeURIComponent(c.name)}`
        }));
        reply.send(response);
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error fetching homepage data" });
    }
});
// NEW: This now powers the categorized Explore page
server.get('/public/explore', async (request, reply) => {
    try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const mapCollection = (c) => ({
            id: c.id, name: c.name, slug: c.slug, author: c.user.username,
            authorAvatar: c.user.profileImageUrl || `https://placehold.co/100x100/E2E8F0/475569?text=${c.user.username.charAt(0).toUpperCase()}`,
            coverImage: c.coverImageUrl || c.products[0]?.product.imageUrls[0] || `https://placehold.co/400x300/cccccc/333333?text=${encodeURIComponent(c.name)}`
        });
        const newCollections = await prisma.collection.findMany({
            where: { createdAt: { gte: sevenDaysAgo } }, take: 5, orderBy: { createdAt: 'desc' },
            include: { user: true, products: { take: 1, orderBy: { displayOrder: 'asc' }, include: { product: true } } }
        }).then(res => res.map(mapCollection));
        const trendingCollections = await prisma.collection.findMany({
            take: 5, orderBy: { likedBy: { _count: 'desc' } },
            include: { user: true, products: { take: 1, orderBy: { displayOrder: 'asc' }, include: { product: true } } }
        }).then(res => res.map(mapCollection));
        reply.send({ new: newCollections, trending: trendingCollections });
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error fetching explore data" });
    }
});
server.get('/public/collections/:username/:slug', async (request, reply) => {
    const { username, slug } = request.params;
    if (!username || !slug) {
        return reply.code(400).send({ message: "Username and slug are required." });
    }
    try {
        const collection = await prisma.collection.findFirst({
            where: { user: { username }, slug },
            include: { user: true, products: { orderBy: { displayOrder: 'asc' }, include: { product: { include: { brand: true } } } } }
        });
        if (!collection)
            return reply.code(404).send({ message: "Collection not found" });
        const publicCollection = {
            id: collection.id, name: collection.name, description: collection.description,
            author: collection.user.username, authorId: collection.user.id, authorAvatar: collection.user.profileImageUrl || `https://placehold.co/100x100/E2E8F0/475569?text=${collection.user.username.charAt(0).toUpperCase()}`,
            products: collection.products.map(cp => ({ id: cp.product.id, name: cp.product.name, imageUrl: cp.product.imageUrls[0], brand: cp.product.brand?.name || "Brand", buyUrl: `/redirect?collectionId=${collection.id}&productId=${cp.product.id}&affiliateUrl=${encodeURIComponent(cp.product.baseUrl)}` }))
        };
        reply.send(publicCollection);
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error fetching public collection" });
    }
});
server.get('/redirect', async (request, reply) => {
    const { collectionId, productId, affiliateUrl } = request.query;
    const decodedUrl = decodeURIComponent(affiliateUrl);
    if (!collectionId || !productId || !decodedUrl) {
        return reply.code(400).send({ message: "Missing tracking parameters." });
    }
    try {
        // THIS IS THE FIX: We now 'await' the database call.
        await prisma.click.create({
            data: {
                collectionId,
                productId,
                userAgent: request.headers['user-agent'] || '',
                ipAddress: request.headers['x-forwarded-for'] || request.ip,
            }
        });
    }
    catch (err) {
        // If logging fails, we still redirect the user so their experience isn't broken.
        server.log.error(err, "Failed to log click, but redirecting anyway.");
    }
    // Now that the click is saved, we can safely redirect.
    return reply
        .code(302)
        .header('Location', decodedUrl)
        .send();
});
// --- ENHANCED SERVER START FUNCTION ---
const start = async () => {
    try {
        const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
        const port = process.env.PORT || 8080;
        const host = '0.0.0.0'; // Critical for Railway
        server.log.info(`Starting server in ${process.env.NODE_ENV} mode`);
        server.log.info(`Server will listen on ${host}:${port}`);
        // Test database connection before starting server
        try {
            await prisma.$connect();
            server.log.info('Database connected successfully');
        }
        catch (dbError) {
            server.log.error('Database connection failed:', dbError);
            throw new Error('Database connection failed');
        }
        await server.listen({ port: Number(port), host });
        server.log.info(`✅ Server successfully started on ${host}:${port}`);
        server.log.info(`🚀 Server is ready to accept connections`);
        server.log.info(`🌐 CORS configured for: ${allowedOrigin}`);
    }
    catch (err) {
        server.log.error('❌ Server startup failed:', err);
        // Graceful shutdown
        await prisma.$disconnect();
        process.exit(1);
    }
};
// --- GRACEFUL SHUTDOWN HANDLING ---
const gracefulShutdown = async (signal) => {
    server.log.info(`Received ${signal}, shutting down gracefully...`);
    try {
        await server.close();
        await prisma.$disconnect();
        server.log.info('Server shut down successfully');
        process.exit(0);
    }
    catch (error) {
        server.log.error('Error during shutdown:', error);
        process.exit(1);
    }
};
// Handle different shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('unhandledRejection', (reason, promise) => {
    server.log.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
// --- START THE SERVER ---
start();
// Export for testing purposes
export { server };
