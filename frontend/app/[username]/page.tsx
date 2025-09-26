'use client';

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, notFound, usePathname } from 'next/navigation';
import { 
    getCreatorProfile, 
    getCreatorCollections, 
    getCreatorProducts,
    getFeedInteractionStatus,
    likeCollection,
    unlikeCollection,
    followCreator,
    unfollowCreator
} from '@/lib/api';
import { useState, useEffect, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Heart, Share2, Eye, UserPlus, Star } from 'lucide-react';
import ShareModal from '@/components/shared/ShareModal';

// --- Reusable Components (can be moved to a shared file) ---

const ProductPreviewCard = ({ product }: { product: any }) => (
    <div className="w-32 flex-shrink-0">
        <a href={product.shopUrl} target="_blank" rel="noopener noreferrer" className="block bg-white rounded-lg p-2 shadow-sm border border-slate-200">
            <div className="aspect-square w-full rounded-md overflow-hidden bg-slate-100">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="mt-2">
                <p className="text-xs font-bold text-slate-800 truncate">{product.brand}</p>
                <p className="text-xs text-slate-500 truncate">{product.name}</p>
            </div>
        </a>
    </div>
);

const MediaCarousel = ({ media }: { media: any[] }) => {
    const firstMedia = media[0];
    if (!firstMedia) return <div className="aspect-square w-full bg-slate-200" />;
    if (firstMedia.type === 'video') {
        return <div className="aspect-square w-full"><video src={firstMedia.url} className="w-full h-full object-cover" controls /></div>;
    }
    return <div className="aspect-square w-full"><img src={firstMedia.url} alt="Collection media" className="w-full h-full object-cover" /></div>;
};

const PostCard = ({ collection }: { collection: any }) => {
    const { user, openAuthModal } = useAuth();
    const queryClient = useQueryClient();
    const [showShareModal, setShowShareModal] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLiked, setIsLiked] = useState(collection.isLiked);
    const [likesCount, setLikesCount] = useState(collection.likes);
    const pageUrl = typeof window !== 'undefined' ? `${window.location.origin}/${collection.author}/${collection.slug}` : '';

    const likeMutation = useMutation({
        mutationFn: () => {
            if (!user) throw new Error("Not logged in");
            const payload = { collectionId: collection.id, userId: user.id };
            return isLiked ? unlikeCollection(payload) : likeCollection(payload);
        },
        onMutate: async () => {
            const previousState = isLiked;
            setIsLiked(!previousState);
            setLikesCount((prev: number) => !previousState ? prev + 1 : prev - 1);
            return { previousState };
        },
        onError: (err, variables, context) => {
            if (context?.previousState !== undefined) {
                setIsLiked(context.previousState);
                setLikesCount((prev: number) => context.previousState ? prev + 1 : prev - 1);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['creatorCollections', collection.author] });
        }
    });

    const handleLikeClick = () => {
        if (!user) openAuthModal(`/${collection.author}/${collection.slug}`);
        else likeMutation.mutate();
    };

    return (
        <>
            <div className="bg-white sm:rounded-xl sm:border sm:border-slate-200 mb-8 flex flex-col">
                <MediaCarousel media={collection.media} />
                {collection.products && collection.products.length > 0 && (
                    <div className="flex space-x-3 overflow-x-auto p-3"><div className="font-bold text-sm text-slate-800 self-center pr-2">Shop The Look</div>
                        {collection.products.map((product: any) => <ProductPreviewCard key={product.id} product={product} />)}
                    </div>
                )}
                <div className="p-3 flex items-center justify-between border-t border-slate-100">
                    <div className="flex items-center space-x-4">
                        <button onClick={handleLikeClick} className="flex items-center space-x-2 text-slate-700 hover:text-red-500">
                            <Heart className={`w-6 h-6 ${isLiked ? 'text-red-500 fill-current' : ''}`} />
                            <span className="font-semibold text-sm">{likesCount.toLocaleString()}</span>
                        </button>
                        <button onClick={() => setShowShareModal(true)} className="text-slate-700 hover:text-teal-500"><Share2 className="w-6 h-6" /></button>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-500">
                        <Eye className="w-5 h-5"/>
                        <span className="font-semibold text-sm">{collection.views.toLocaleString()}</span>
                    </div>
                </div>
                <div className="px-3 pb-3">
                    <Link href={`/${collection.author}/${collection.slug}`} className="font-bold text-sm text-slate-800 hover:underline">{collection.name}</Link>
                    {collection.description && (
                        <>
                            <p className={`text-sm text-slate-700 mt-1 ${!isExpanded && 'line-clamp-2'}`}>{collection.description}</p>
                            {collection.description.length > 100 && (
                                <button onClick={() => setIsExpanded(!isExpanded)} className="text-sm text-slate-500 font-semibold mt-1">
                                    {isExpanded ? '...see less' : 'see more'}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
            <ShareModal url={pageUrl} isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
        </>
    );
};

// --- Tab Content Components ---
const PostsTab = ({ username }: { username: string }) => {
    const { user } = useAuth();
    const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['creatorCollections', username],
        queryFn: ({ pageParam }) => getCreatorCollections(username, pageParam),
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialPageParam: undefined,
    });
    
    const collections = data?.pages.flatMap(page => page.collections) ?? [];

    const { data: interactionStatus } = useQuery({
        queryKey: ['feedInteractionStatus', collections.map(c => c.id), user?.id],
        queryFn: () => getFeedInteractionStatus(collections.map(c => c.id), user!.id),
        enabled: !!user && collections.length > 0,
    });

    const collectionsWithStatus = useMemo(() => {
        if (!interactionStatus) return collections;
        return collections.map(col => ({
            ...col,
            isLiked: interactionStatus[col.id]?.isLiked || false,
        }));
    }, [collections, interactionStatus]);

    if (isLoading) return <p className="text-center p-8">Loading posts...</p>;

    return (
        <InfiniteScroll
            dataLength={collectionsWithStatus.length}
            next={fetchNextPage}
            hasMore={hasNextPage || false}
            loader={<p className="text-center py-4">Loading more...</p>}
            endMessage={<p className="text-center py-4 text-slate-500">You've reached the end!</p>}
        >
            {collectionsWithStatus.map((col: any) => <PostCard key={col.id} collection={col} />)}
        </InfiniteScroll>
    );
};

const RecommendedProductsTab = ({ username }: { username: string }) => {
    const { data: products, isLoading } = useQuery({
        queryKey: ['creatorProducts', username],
        queryFn: () => getCreatorProducts(username)
    });

    if (isLoading) return <p className="text-center p-8">Loading recommended products...</p>;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {products.map((product: any) => (
                <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm group">
                    <div className="aspect-square w-full bg-slate-100 rounded-lg overflow-hidden mb-4">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-semibold text-slate-800 truncate">{product.name}</h3>
                    <p className="text-sm text-slate-500">{product.brand}</p>
                </div>
            ))}
        </div>
    );
};

// --- MAIN PAGE ---
export default function CreatorProfilePage() {
    const params = useParams();
    const { user } = useAuth();
    const username = params.username as string;
    const [activeTab, setActiveTab] = useState('Posts');

    const { data: creator, isLoading, isError } = useQuery({
        queryKey: ['creatorProfile', username],
        queryFn: () => getCreatorProfile(username),
        enabled: !!username,
    });

    if (isLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div></div>;
    if (isError || !creator) return notFound();

    return (
        <div className="bg-white">
            <main>
                <section className="text-center py-12 border-b border-slate-200">
                    <div className="container mx-auto px-4">
                        <img src={creator.profileImageUrl || `https://placehold.co/100x100/E2E8F0/475569?text=${creator.username.charAt(0).toUpperCase()}`} alt={creator.username} className="w-24 h-24 rounded-full mx-auto shadow-lg" />
                        <h1 className="mt-4 text-4xl font-extrabold text-slate-900 tracking-tight">{creator.fullName || creator.username}</h1>
                        <p className="mt-2 text-slate-600">@{creator.username}</p>
                        {creator.bio && <p className="mt-4 max-w-xl mx-auto text-md text-slate-700">{creator.bio}</p>}
                        <div className="mt-6 flex justify-center items-center space-x-6">
                            <div className="text-center"><p className="font-bold text-xl text-slate-800">{creator._count.followers.toLocaleString()}</p><p className="text-sm text-slate-500">Followers</p></div>
                            <div className="text-center"><p className="font-bold text-xl text-slate-800">{creator.collections.length}</p><p className="text-sm text-slate-500">Collections</p></div>
                        </div>
                    </div>
                </section>

                <div className="border-b border-slate-200">
                    <div className="container mx-auto flex">
                        <button onClick={() => setActiveTab('Posts')} className={`px-4 py-3 font-semibold ${activeTab === 'Posts' ? 'border-b-2 border-slate-800 text-slate-800' : 'text-slate-500'}`}>Posts</button>
                        <button onClick={() => setActiveTab('Recommended Products')} className={`px-4 py-3 font-semibold ${activeTab === 'Recommended Products' ? 'border-b-2 border-slate-800 text-slate-800' : 'text-slate-500'}`}>Recommended Products</button>
                    </div>
                </div>

                <div className="bg-slate-50">
                    <div className="container mx-auto py-8">
                        {activeTab === 'Posts' && <div className="max-w-lg mx-auto"><PostsTab username={username} /></div>}
                        {activeTab === 'Recommended Products' && <RecommendedProductsTab username={username} />}
                    </div>
                </div>
            </main>
        </div>
    );
}