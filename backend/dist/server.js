// src/server.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';
import * as cheerio from 'cheerio';
//import pTimeout from 'p-timeout'; 
import axios from 'axios';
if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config();
}
//const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119 Safari/537.36',
];
function pickUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}
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
const AI_API_CALL_LIMIT = 100; // Our own internal monthly limit
// Enhanced CORS configuration
// World-Class Plugin Registration
const allowedOrigins = [
    'http://localhost:3000',
    'https://mystash.in',
    'https://www.mystash.in',
    'https://surecart-monorepo.vercel.app', // your deployed frontend
    'https://www.mystash.shop',
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
// server.ts (or routes/search.ts) — Fastify route
// Make sure `prisma` is your PrismaClient instance.
// GET /search?q=...
server.get('/search', async (request, reply) => {
    const { q } = request.query;
    if (!q) {
        return reply.code(400).send({ message: "Search query is required." });
    }
    try {
        const [creators, collections, products, brands] = await prisma.$transaction([
            // Search for Creators
            prisma.user.findMany({
                where: {
                    role: 'CREATOR',
                    username: { contains: q, mode: 'insensitive' }
                },
                take: 5,
                select: { id: true, username: true, profileImageUrl: true }
            }),
            // Search for Collections
            prisma.collection.findMany({
                where: { name: { contains: q, mode: 'insensitive' } },
                take: 10,
                include: { user: { select: { username: true } } }
            }),
            // Search for Products
            prisma.product.findMany({
                where: { name: { contains: q, mode: 'insensitive' } },
                take: 10,
                include: { brand: { select: { name: true } } }
            }),
            prisma.brand.findMany({
                where: { name: { contains: q, mode: 'insensitive' } },
                take: 5
            })
        ]);
        reply.send({ creators, collections, products, brands });
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error performing search" });
    }
});
// backend/src/server.ts
// ... (other routes) ...
// ++ NEW ENDPOINT: To record a click on a product link ++
server.post('/products/:productId/click', async (request, reply) => {
    const { productId } = request.params;
    const { userId, collectionId } = request.body;
    if (!collectionId) {
        return reply.code(400).send({ message: "Collection ID is required to track a click." });
    }
    try {
        const data = {
            productId: productId,
            collectionId: collectionId,
        };
        // If a userId is provided, connect the click to that user.
        if (userId) {
            data.user = {
                connect: { id: userId }
            };
        }
        await prisma.click.create({ data });
        return reply.code(200).send({ message: "Click recorded." });
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error recording click" });
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
            include: { _count: { select: { products: true, clicks: true, likedBy: true, views: true } } },
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
        // --- 2. Aggregate Real Data day by Day ---
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
            shares: c._count.views
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
        const userWithBrand = await prisma.user.findUnique({
            where: { id: user.id },
            include: { brands: true }
        });
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
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!email || !authProviderId || !username) {
        return reply.code(400).send({ message: "Email, username, and authProviderId are required." });
    }
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        let user;
        let isNewUser = false;
        if (existingUser) {
            user = await prisma.user.update({
                where: { email },
                data: { authProviderId }, // Update the auth provider ID just in case
            });
        }
        else {
            user = await prisma.user.create({
                data: {
                    email,
                    username,
                    authProviderId,
                    profileImageUrl,
                    role: 'SHOPPER', // New social signups always default to Shopper
                },
            });
            isNewUser = true; // This is a new user
        }
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
    const { fullName, phone, instagramHandle, profileImageUrl, bio } = request.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                role: 'CREATOR',
                fullName,
                bio,
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
// POST /auth/forgot-password
server.post('/auth/forgot-password', async (request, reply) => {
    const { email } = request.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
        // Generate a secure, random token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minute expiry
        await prisma.user.update({
            where: { email },
            data: { passwordResetToken, passwordResetExpires },
        });
        // --- THIS IS THE WORLD-CLASS "SIMULATED EMAIL" ---
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
        // Instead of sending an email, we log the link to the console for the developer.
        server.log.info(`
        =====================================================
        PASSWORD RESET LINK (for developer testing):
        ${resetUrl}
        =====================================================
        `);
    }
    // We always send the same success message to prevent email enumeration attacks.
    reply.send({ message: 'If a user with that email exists, a password reset link has been sent.' });
});
// POST /auth/reset-password
server.post('/auth/reset-password', async (request, reply) => {
    const { token, password } = request.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await prisma.user.findFirst({
        where: {
            passwordResetToken: hashedToken,
            passwordResetExpires: { gt: new Date() },
        }
    });
    if (!user) {
        return reply.code(400).send({ message: 'Token is invalid or has expired.' });
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await prisma.user.update({
        where: { id: user.id },
        data: {
            authProviderId: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null,
        }
    });
    reply.send({ message: 'Password has been successfully reset.' });
});
// GET /products/:productId
server.get('/products/:productId', async (request, reply) => {
    const { productId } = request.params;
    try {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { brand: true }
        });
        if (!product) {
            return reply.code(404).send({ message: "Product not found" });
        }
        // Now, find all collections that include this product
        const collectionsContainingProduct = await prisma.collection.findMany({
            where: { products: { some: { productId: productId } } },
            include: {
                user: { select: { username: true, profileImageUrl: true } },
                products: { take: 1, orderBy: { displayOrder: 'asc' }, include: { product: true } }
            }
        });
        const response = {
            product,
            collections: collectionsContainingProduct.map((c) => ({
                id: c.id, name: c.name, slug: c.slug, author: c.user.username,
                authorAvatar: c.user.profileImageUrl || `https://placehold.co/100x100/E2E8F0/475569?text=${c.user.username.charAt(0).toUpperCase()}`,
                coverImage: c.coverImageUrl || c.products[0]?.product.imageUrls[0] || `https://placehold.co/400x300/cccccc/333333?text=${encodeURIComponent(c.name)}`
            }))
        };
        reply.send(response);
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error fetching product details" });
    }
});
// ++ NEW ENDPOINT: Fetches metadata from a URL instead ++
server.post('/api/fetch-url-metadata', async (request, reply) => {
    const { url } = request.body;
    if (!url) {
        return reply.code(400).send({ message: "URL is required." });
    }
    try {
        // Axios will automatically follow redirects from shortened URLs like amzn.to
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        // We use the final URL after any redirects
        const finalUrl = response.request.res.responseUrl || url;
        const html = response.data;
        const $ = cheerio.load(html);
        const title = $('meta[property="og:title"]').attr('content') || $('#productTitle').text().trim() || 'No title found';
        // ++ THIS IS THE SMARTER IMAGE SCRAPING LOGIC ++
        // It checks multiple common locations for the main product image on Amazon
        let imageUrl = $('meta[property="og:image"]').attr('content') ||
            $('#landingImage').attr('src') ||
            $('#imgBlkFront').attr('src') ||
            null;
        if (!imageUrl || !title) {
            return reply.code(404).send({
                error: "MANUAL_ENTRY_REQUIRED",
                message: "Product details not found, please enter manually."
            });
        }
        const description = $('meta[property="og:description"]').attr('content') || $('#feature-bullets').text().trim() || null;
        reply.send({ title, imageUrl, description, baseUrl: finalUrl });
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({
            error: "MANUAL_ENTRY_REQUIRED",
            message: "Failed to fetch from that URL. Please enter details manually."
        });
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
// GET /public/creators/:username
server.get('/public/creators/:username', async (request, reply) => {
    const { username } = request.params;
    try {
        const creator = await prisma.user.findUnique({
            where: { username },
            // THIS IS THE FIX: We use 'include' to fetch all related data
            include: {
                _count: { select: { followers: true } },
                collections: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: { select: { username: true } },
                        products: { take: 1, orderBy: { displayOrder: 'asc' }, include: { product: true } }
                    }
                }
            }
        });
        if (!creator || creator.role !== 'CREATOR') {
            return reply.code(404).send({ message: "Creator not found" });
        }
        // The rest of the function can now safely access creator.collections and creator.bio
        const response = {
            id: creator.id,
            username: creator.username,
            fullName: creator.fullName,
            profileImageUrl: creator.profileImageUrl,
            bio: creator.bio, // This now works
            _count: creator._count,
            collections: creator.collections.map((c) => ({
                id: c.id, name: c.name, slug: c.slug, author: c.user.username,
                coverImage: c.coverImageUrl || c.products[0]?.product.imageUrls[0] || `https://placehold.co/400x300/cccccc/333333?text=${encodeURIComponent(c.name)}`
            }))
        };
        reply.send(response);
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error fetching creator profile" });
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
            include: { _count: { select: { products: true, likedBy: true, views: true, // <-- Fetch real view count
                        clicks: true } } }
        });
        const responseData = collections.map(c => ({
            id: c.id, name: c.name, slug: c.slug,
            productsCount: c._count.products,
            likes: c._count.likedBy,
            views: c._count.views, // <-- Pass real view count
            clicks: c._count.clicks, // <-- Pass real click count
            // A realistic simulated share count based on other metrics
            shares: Math.floor((c._count.views / 20) + (c._count.likedBy * 2)),
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
    // 1. DESTRUCTURE THE INCOMING DATA
    // The 'products' array can contain a mix of existing and new custom products.
    let { name, products, userId, description, coverImageUrl } = request.body;
    // 2. BASIC VALIDATION
    if (!userId || !products || !name) {
        return reply.code(400).send({ message: "Name, products, and userId are required." });
    }
    try {
        const productLinks = [];
        // 3. SEPARATE EXISTING PRODUCTS FROM NEW CUSTOM ONES
        const existingProducts = products.filter((p) => !p.isCustom);
        const customProducts = products.filter((p) => p.isCustom);
        const existingProductIds = existingProducts.map((p) => p.id);
        // 4. VALIDATE EXISTING PRODUCTS
        // This is the crucial check to ensure all non-custom products are legitimate.
        if (existingProductIds.length > 0) {
            const foundProductsCount = await prisma.product.count({
                where: { id: { in: existingProductIds } },
            });
            if (foundProductsCount !== existingProductIds.length) {
                return reply.code(400).send({ message: "One or more of the selected products do not exist." });
            }
        }
        // Add the validated existing products to our final list for linking
        for (const id of existingProductIds) {
            productLinks.push({ productId: id });
        }
        // 5. CREATE NEW CUSTOM PRODUCTS
        // Loop through the new custom products and create them in the database.
        for (const customProduct of customProducts) {
            const newProduct = await prisma.product.create({
                data: {
                    name: customProduct.name,
                    imageUrls: [customProduct.imageUrl],
                    baseUrl: customProduct.baseUrl,
                    source: 'CUSTOM',
                    isCustom: true,
                    addedByUser: {
                        connect: {
                            id: userId
                        }
                    }, // Link the product to the creator who added it
                    brand: {
                        connectOrCreate: {
                            where: { name: customProduct.brand || 'Custom' },
                            create: { name: customProduct.brand || 'Custom' },
                        },
                    },
                },
            });
            // Add the newly created product's ID to our final list for linking
            productLinks.push({ productId: newProduct.id });
        }
        // 6. SET A DEFAULT COVER IMAGE
        // If no cover image was uploaded, use the image of the first product in the collection.
        if (!coverImageUrl && productLinks.length > 0) {
            const firstProduct = await prisma.product.findUnique({ where: { id: productLinks[0].productId } });
            if (firstProduct) {
                coverImageUrl = firstProduct.imageUrls[0];
            }
        }
        // 7. CREATE THE COLLECTION AND LINK ALL PRODUCTS
        // This is the final step where the collection is created and connected to all products.
        const newCollection = await prisma.collection.create({
            data: {
                name,
                slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                userId,
                description,
                coverImageUrl,
                products: {
                    create: productLinks.map((p, index) => ({
                        productId: p.productId,
                        displayOrder: index, // Set the order of products in the collection
                    })),
                },
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
server.get('/public/campaigns', async (request, reply) => {
    try {
        const campaigns = await prisma.campaign.findMany({
            where: { isActive: true },
            include: {
                brand: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        reply.send(campaigns);
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error fetching campaigns" });
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
// ++ NEW ENDPOINT: Get categories for a campaign ++
server.get('/public/campaigns/:campaignId/categories', async (request, reply) => {
    const { campaignId } = request.params;
    try {
        // This query finds all categories that are associated with products within the given campaign.
        const categories = await prisma.category.findMany({
            where: {
                products: {
                    some: {
                        product: {
                            campaigns: {
                                some: {
                                    campaignId: campaignId,
                                },
                            },
                        },
                    },
                },
            },
            select: { id: true, name: true }
        });
        reply.send(categories);
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error fetching categories for campaign" });
    }
});
// This is the recursive helper function that builds the category tree
const buildCategoryTree = (categories, parentId = null) => {
    const tree = [];
    // Find all direct children of the current parentId
    const children = categories.filter(c => c.parentId === parentId);
    // For each child, find its own children recursively
    for (const child of children) {
        const subCategories = buildCategoryTree(categories, child.id);
        const node = { ...child, subCategories: subCategories };
        tree.push(node);
    }
    return tree;
};
server.get('/public/categories', async (request, reply) => {
    try {
        // 1. Fetch ALL categories from the database in a single, efficient query.
        const allCategories = await prisma.category.findMany({
            // THIS IS THE CORRECTED SECTION WITH THE `select` CLAUSE
            select: {
                id: true,
                name: true,
                parentId: true // parentId is crucial for building the tree
            },
            orderBy: {
                name: 'asc'
            },
        });
        // 2. Build the nested tree structure from the flat list in memory.
        const categoryTree = buildCategoryTree(allCategories);
        reply.send(categoryTree);
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error fetching categories" });
    }
});
// --- PUBLIC & UNIVERSAL ROUTES ---
server.get('/products/search', async (request, reply) => {
    const { q, brandId, campaignId, categoryId } = request.query;
    try {
        const whereClause = {
            name: {
                contains: q || '',
                mode: 'insensitive',
            },
        };
        if (brandId) {
            whereClause.brandId = brandId;
        }
        // ++ NEW LOGIC: Filter by campaign if campaignId is provided ++
        if (campaignId) {
            whereClause.campaigns = {
                some: {
                    campaignId: campaignId
                }
            };
        }
        if (categoryId) { // <-- ADD THIS LOGIC
            whereClause.categories = { some: { categoryId: categoryId } };
        }
        const products = await prisma.product.findMany({
            where: whereClause,
            include: { brand: true },
        });
        const response = products.map(p => ({
            id: p.id,
            name: p.name,
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
server.post('/collections/:collectionId/view', async (request, reply) => {
    const { collectionId } = request.params;
    const { userId } = request.body; // The logged-in user (optional)
    try {
        const collection = await prisma.collection.findUnique({
            where: { id: collectionId },
            select: { userId: true } // Select only the owner's ID for efficiency
        });
        if (!collection) {
            return reply.code(404).send({ message: "Collection not found" });
        }
        // THIS IS THE NEW CONDITION
        // Only record a view if there is no logged-in user OR if the logged-in user
        // is not the owner of the collection.
        if (!userId || userId !== collection.userId) {
            await prisma.collectionView.create({
                data: {
                    collectionId: collectionId,
                    userId: userId, // Can be null for anonymous views
                }
            });
        }
        // Always send a success response, even if a view was not recorded.
        return reply.code(200).send({ message: "View processed." });
    }
    catch (error) {
        server.log.error(error);
        reply.code(500).send({ message: "Error processing view" });
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
// in backend/src/server.ts, create or update the brand registration endpoint
// NEW: This powers the Pinterest-style infinite feed on the homepage
server.get('/public/home', async (request, reply) => {
    try {
        const collections = await prisma.collection.findMany({
            take: 50, // A reasonable limit for the initial feed
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { username: true, profileImageUrl: true } },
                products: {
                    take: 5,
                    orderBy: { displayOrder: 'asc' },
                    include: {
                        product: {
                            select: {
                                id: true, name: true, imageUrls: true, baseUrl: true, price: true,
                                discountPercentage: true, rating: true,
                                brand: { select: { name: true } }
                            }
                        }
                    }
                },
                _count: { select: { views: true, likedBy: true } }
            }
        });
        const response = collections.map(c => ({
            id: c.id, name: c.name, slug: c.slug, author: c.user.username,
            views: c._count.views,
            likes: c._count.likedBy,
            authorAvatar: c.user.profileImageUrl || `https://placehold.co/100x100/E2E8F0/475569?text=${c.user.username.charAt(0).toUpperCase()}`,
            media: c.media.length > 0 ? c.media : [{ type: 'image', url: c.coverImageUrl || c.products[0]?.product.imageUrls[0] }],
            products: c.products.map(p => ({
                id: p.product.id,
                name: p.product.name,
                imageUrl: p.product.imageUrls[0],
                shopUrl: p.product.baseUrl,
                price: p.product.price,
                brand: p.product.brand?.name || 'Brand',
                discountPercentage: p.product.discountPercentage,
                rating: p.product.rating
            }))
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
            id: collection.id,
            name: collection.name,
            description: collection.description,
            author: collection.user.username,
            authorId: collection.user.id,
            authorAvatar: collection.user.profileImageUrl || `https://placehold.co/100x100/E2E8F0/475569?text=${collection.user.username.charAt(0).toUpperCase()}`,
            products: collection.products.map((cp) => {
                // THIS IS THE NEW LOGIC BLOCK YOU ASKED FOR
                const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
                const affiliateUrlWithTag = cp.product.baseUrl + `?tag=surecart-21`; // Placeholder affiliate tag
                //const buyUrl = `${backendUrl}/redirect?collectionId=${collection.id}&productId=${cp.product.id}&affiliateUrl=${encodeURIComponent(affiliateUrlWithTag)}`;
                return {
                    id: cp.product.id,
                    name: cp.product.name,
                    imageUrl: cp.product.imageUrls[0],
                    brand: cp.product.brand?.name || "Brand",
                    buyUrl: cp.product.baseUrl, // Use the correctly constructed URL
                };
            })
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
