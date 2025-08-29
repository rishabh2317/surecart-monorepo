// app/[username]/[collectionSlug]/page.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, notFound, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context'; // This is the CORRECT import
import Link from 'next/link';
import { ExternalLink, Heart, Share2, Check, MessageCircle, Sparkles, UserPlus } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import AskAIDrawer from '@/components/shared/AskAIDrawer';
import ShareModal from '@/components/shared/ShareModal';
import { API_BASE_URL } from '@/lib/config';

// --- API Functions (Preserved from your working code) ---
async function getCollectionData(username: string, slug: string) {
    const res = await fetch(`${API_BASE_URL}/public/collections/${username}/${slug}`);
    if (!res.ok) throw new Error("Collection not found");
    return res.json();
}

async function likeCollection({ collectionId, userId }: { collectionId: string, userId: string }) {
    const res = await fetch(`${API_BASE_URL}/collections/${collectionId}/like`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }),
    });
    if (!res.ok) { const error = await res.json(); throw new Error(error.message); }
    return res.json();
}

async function unlikeCollection({ collectionId, userId }: { collectionId: string, userId: string }) {
    const res = await fetch(`${API_BASE_URL}/collections/${collectionId}/unlike`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error("Failed to unlike");
    return res.json();
}

async function getLikeStatus(collectionId: string, userId: string) {
    if (!collectionId || !userId) return { isLiked: false };
    const res = await fetch(`${API_BASE_URL}/users/${userId}/liked-status/${collectionId}`);
    if (!res.ok) return { isLiked: false };
    return res.json();
}

async function followCreator({ creatorId, userId }: { creatorId: string, userId: string }) {
    const res = await fetch(`${API_BASE_URL}/users/${creatorId}/follow`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error("Failed to follow");
    return res.json();
}

const unfollowCreator = async ({ creatorId, userId }: { creatorId: string, userId: string }) => {
    const res = await fetch(`${API_BASE_URL}/users/${creatorId}/unfollow`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error("Failed to unfollow");
    return true;
};

const getFollowStatus = async (creatorId: string, userId: string) => {
    // This check prevents the API call if IDs are not ready
    if (!creatorId || !userId) return { isFollowing: false };
    const res = await fetch(`${API_BASE_URL}/users/${userId}/follow-status/${creatorId}`);
    if (!res.ok) return { isFollowing: false };
    return res.json();
};


async function postComment({ collectionId, userId, text }: { collectionId: string, userId: string, text: string }) {
    const res = await fetch(`${API_BASE_URL}/collections/${collectionId}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, text }),
    });
    if (!res.ok) throw new Error("Failed to post comment");
    return res.json();
}

async function getComments(collectionId: string) {
    if (!collectionId) return [];
    const res = await fetch(`${API_BASE_URL}/collections/${collectionId}/comments`);
    if (!res.ok) return [];
    return res.json();
}


// --- SUB-COMPONENTS (Preserved and redesigned from your working code) ---
// --- SUB-COMPONENTS for a clean structure ---
const ProductCard = ({ product }: { product: any }) => {
    const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col overflow-hidden group">
                <div className="aspect-square w-full overflow-hidden">
                    <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                </div>
                <div className="p-4 flex-grow flex flex-col">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{product.brand}</p>
                    <h3 className="font-bold text-md text-slate-800 flex-grow mt-1">{product.name}</h3>
                    
                    <div className="mt-4 space-y-2">
                        <button 
                            onClick={() => setIsAiDrawerOpen(true)}
                            className="w-full text-sm font-semibold text-teal-600 hover:text-teal-100 flex items-center justify-center space-x-2 py-2 bg-teal-100 rounded-lg hover:bg-teal-50"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>AI Summary</span>
                        </button>
                        
                        <a 
                            href={product.buyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center px-4 py-2 font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-900"
                        >
                            Shop Now
                            <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                    </div>
                </div>
            </div>
            <AskAIDrawer
                productName={product.name}
                isOpen={isAiDrawerOpen}
                onClose={() => setIsAiDrawerOpen(false)}
            />
        </>
    );
};

// --- MAIN PAGE COMPONENT (Preserved and redesigned from your working code) ---
export default function PublicCollectionPage() {
    const params = useParams();
    const pathname = usePathname();
    const { user, openAuthModal } = useAuth();
    const queryClient = useQueryClient();
    const [copied, setCopied] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [isFollowing, setIsFollowing] = useState(false);
    const commentsSectionRef = useRef<HTMLElement>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [pageUrl, setPageUrl] = useState('');
    const username = params.username as string;
    const collectionSlug = params.collectionSlug as string;
    
    const { data: collection, isLoading, isError } = useQuery({
        queryKey: ['publicCollection', username, collectionSlug],
        queryFn: () => getCollectionData(username, collectionSlug),
    });

    useEffect(() => {
        // Set the page URL on the client-side
        setPageUrl(window.location.href);
    }, []);
  

    // --- ADD THIS NEW useEffect HOOK ---
    useEffect(() => {
        // This ensures we only log a view once the collection data has successfully loaded
        if (collection && collection.id) {
            fetch(`${API_BASE_URL}/public/collections/${collection.id}/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // If a user is logged in, we can associate the view with them
                body: JSON.stringify({ userId: user?.id || null }),
            });
        }
    }, [collection, user]); // This hook runs whenever the collection data or user state changes

    const likeStatusQueryKey = ['likeStatus', collection?.id, user?.id];
    const { data: likeStatus } = useQuery({
        queryKey: likeStatusQueryKey,
        queryFn: () => getLikeStatus(collection!.id, user!.id),
        enabled: !!user && !!collection,
    });
    
    const { data: followStatusData } = useQuery<{ isFollowing: boolean } | undefined, Error>({
        queryKey: ['followStatus', collection?.authorId, user?.id],
        queryFn: () => {
            if (!user) return Promise.resolve({ isFollowing: false });
            return getFollowStatus(collection.authorId, user.id);
        },
        enabled: !!user && !!collection,
    });
    
    // Handle the success with useEffect
    useEffect(() => {
        if (followStatusData) {
            setIsFollowing(followStatusData.isFollowing);
        }
    }, [followStatusData]);
    const commentsQueryKey = ['comments', collection?.id];
    const { data: comments = [] } = useQuery({
        queryKey: commentsQueryKey,
        queryFn: () => getComments(collection!.id),
        enabled: !!collection,
    });

    const likeMutation = useMutation({
        mutationFn: (isCurrentlyLiked: boolean) => {
            if (!user || !collection) throw new Error("User or collection not found");
            const payload = { collectionId: collection.id, userId: user.id };
            return isCurrentlyLiked ? unlikeCollection(payload) : likeCollection(payload);
        },
        onMutate: async (isCurrentlyLiked: boolean) => {
            await queryClient.cancelQueries({ queryKey: likeStatusQueryKey });
            const previousLikeStatus = queryClient.getQueryData(likeStatusQueryKey);
            queryClient.setQueryData(likeStatusQueryKey, { isLiked: !isCurrentlyLiked });
            return { previousLikeStatus };
        },
        onError: (err, variables, context) => {
            if (context?.previousLikeStatus) {
                queryClient.setQueryData(likeStatusQueryKey, context.previousLikeStatus);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: likeStatusQueryKey });
            queryClient.invalidateQueries({ queryKey: ['likedCollections', user?.id] });
        },
    });

    const followMutation = useMutation({
        mutationFn: followCreator,
        onSuccess: () => {
            setIsFollowing(true);
        },
        onError: (error: any) => {
            // This is the FIX: We check for the specific error from our server.
            // If the user is already following, we can silently update the UI to match.
            if (error.message.includes("Already following")) {
                setIsFollowing(true);
            } else {
                alert("An error occurred. Please try again.");
            }
        }
    });

    const unfollowMutation = useMutation({
        mutationFn: unfollowCreator,
        onSuccess: () => setIsFollowing(false), // Update state on success
    });

    const commentMutation = useMutation({
        mutationFn: postComment,
        onSuccess: () => {
            setNewComment("");
            queryClient.invalidateQueries({ queryKey: commentsQueryKey });
        },
    });
    

    useEffect(() => {
        if (showComments && commentsSectionRef.current) {
            commentsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [showComments]);

    const handleToggleLike = () => {
        if (!user) openAuthModal(pathname);
        else likeMutation.mutate(likeStatus?.isLiked ?? false);
    };

    // The handleShare function is now simpler
    const handleShare = () => {
        setShowShareModal(true);
    };

    const handleFollow = () => {
        if (!user) {
            openAuthModal(pathname);
        } else if (collection && collection.authorId) {
            if (isFollowing) {
                unfollowMutation.mutate({ creatorId: collection.authorId, userId: user.id });
            } else {
                followMutation.mutate({ creatorId: collection.authorId, userId: user.id });
            }
        }else {
            console.error("Could not follow creator: authorId is missing from collection data.");
            alert("Could not perform action. Please try again later.");
        }
    };

    const handleCommentClick = () => {
        if (!user && !showComments) {
            openAuthModal(pathname);
        } else {
            setShowComments(!showComments);
        }
    };

    const handlePostComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (collection && newComment.trim() && user) {
            commentMutation.mutate({ 
                collectionId: collection.id, 
                userId: user.id, 
                text: newComment 
            });
        }
    };

    if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    if (isError || !collection) {
        notFound();
    }

    const isLiked = likeStatus?.isLiked ?? false;

    return (
        <>
         <div className="bg-slate-50 min-h-screen">
                <header className="py-8 px-4 bg-white border-b border-slate-200">
                    <div className="container mx-auto">
                        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6">
                            <img src={collection.authorAvatar} alt={collection.author} className="w-24 h-24 rounded-full shadow-lg flex-shrink-0" />
                            <div className="flex-grow">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{collection.name}</h1>
                                <p className="mt-1 text-slate-600">
                                    A collection by <span className="font-semibold text-teal-600">{collection.author}</span>
                                    <Link href={`/${collection.author}`} className="font-semibold text-teal-600 hover:underline">
                                        {collection.author}
                                    </Link>
                                </p>
                                {collection.description && (
                                    <p className="mt-2 max-w-2xl mx-auto md:mx-0 text-sm text-slate-500">{collection.description}</p>
                                )}
                            </div>
                            <div className="flex-shrink-0 flex items-center justify-center gap-2 pt-2">
                                <button onClick={handleFollow} disabled={followMutation.isPending || unfollowMutation.isPending} className="flex items-center space-x-2 px-4 py-2 bg-white border rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-100">
                                    <UserPlus className={`w-4 h-4 ${isFollowing ? 'text-green-500' : 'text-blue-500'}`} />
                                    <span>{isFollowing ? 'Following' : 'Follow'}</span>
                                </button>
                                <button onClick={handleToggleLike} disabled={likeMutation.isPending} className="p-2 bg-white border rounded-full text-slate-500 hover:bg-slate-100">
                                    <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'text-red-500 fill-current' : ''}`} />
                                </button>
                                <button onClick={handleCommentClick} className="p-2 bg-white border rounded-full text-slate-500 hover:bg-slate-100">
                                    <MessageCircle className="w-5 h-5" />
                                </button>
                                <button onClick={handleShare} className="p-2 bg-white border rounded-full text-slate-500 hover:bg-slate-100">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {collection.products.map((product: any) => (<ProductCard key={product.id} product={product} />))}
                    </div>
                </main>
            {showComments && (
                <section ref={commentsSectionRef} className="bg-white py-8 sm:py-12">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                        <h3 className="text-2xl font-bold text-slate-800 mb-6">Comments ({comments.length})</h3>
                        <form onSubmit={handlePostComment} className="flex space-x-3 mb-8">
                            <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder={user ? "Add a comment..." : "Log in to comment"} className="flex-grow p-3 border border-slate-300 rounded-lg" disabled={!user} />
                            <button type="submit" disabled={!user || commentMutation.isPending} className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg">Post</button>
                        </form>
                        <div className="space-y-6">
                            {comments.map((comment: any) => (
                                <div key={comment.id} className="flex items-start space-x-3">
                                    <img src={comment.user.profileImageUrl || `https://placehold.co/100x100/E2E8F0/475569?text=${comment.user.username.charAt(0).toUpperCase()}`} alt={comment.user.username} className="w-10 h-10 rounded-full" />
                                    <div className="bg-slate-100 p-3 rounded-lg flex-1">
                                        <p className="font-semibold text-sm text-slate-800">{comment.user.username}</p>
                                        <p className="text-slate-700">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                            {comments.length === 0 && <p className="text-slate-500 text-center py-4">Be the first to comment.</p>}
                        </div>
                    </div>
                </section>
            )}
        </div>
        <ShareModal 
                url={pageUrl}
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
            />
        </>
    );
}