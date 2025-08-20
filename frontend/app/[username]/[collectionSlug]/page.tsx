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

// --- API Functions (Preserved from your working code) ---
async function getCollectionData(username: string, slug: string) {
    const res = await fetch(`http://localhost:3001/public/collections/${username}/${slug}`);
    if (!res.ok) throw new Error("Collection not found");
    return res.json();
}

async function likeCollection({ collectionId, userId }: { collectionId: string, userId: string }) {
    const res = await fetch(`http://localhost:3001/collections/${collectionId}/like`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }),
    });
    if (!res.ok) { const error = await res.json(); throw new Error(error.message); }
    return res.json();
}

async function unlikeCollection({ collectionId, userId }: { collectionId: string, userId: string }) {
    const res = await fetch(`http://localhost:3001/collections/${collectionId}/unlike`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error("Failed to unlike");
    return res.json();
}

async function getLikeStatus(collectionId: string, userId: string) {
    if (!collectionId || !userId) return { isLiked: false };
    const res = await fetch(`http://localhost:3001/users/${userId}/liked-status/${collectionId}`);
    if (!res.ok) return { isLiked: false };
    return res.json();
}

async function followCreator({ creatorId, userId }: { creatorId: string, userId: string }) {
    const res = await fetch(`http://localhost:3001/users/${creatorId}/follow`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error("Failed to follow");
    return res.json();
}

const unfollowCreator = async ({ creatorId, userId }: { creatorId: string, userId: string }) => {
    const res = await fetch(`http://localhost:3001/users/${creatorId}/unfollow`, {
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
    const res = await fetch(`http://localhost:3001/users/${userId}/follow-status/${creatorId}`);
    if (!res.ok) return { isFollowing: false };
    return res.json();
};


async function postComment({ collectionId, userId, text }: { collectionId: string, userId: string, text: string }) {
    const res = await fetch(`http://localhost:3001/collections/${collectionId}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, text }),
    });
    if (!res.ok) throw new Error("Failed to post comment");
    return res.json();
}

async function getComments(collectionId: string) {
    if (!collectionId) return [];
    const res = await fetch(`http://localhost:3001/collections/${collectionId}/comments`);
    if (!res.ok) return [];
    return res.json();
}


// --- SUB-COMPONENTS (Preserved and redesigned from your working code) ---
// --- SUB-COMPONENTS for a clean structure ---
const ProductCard = ({ product }: { product: any }) => {
    const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

    return (
        <>
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden group">
                <div className="aspect-square w-full overflow-hidden">
                    <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                </div>
                <div className="p-5 flex-grow flex flex-col">
                    <p className="text-sm text-slate-500">{product.brand}</p>
                    <h3 className="font-bold text-lg text-slate-900 flex-grow mt-1">{product.name}</h3>
                    
                    <button 
                        onClick={() => setIsAiDrawerOpen(true)}
                        className="w-full text-sm font-semibold text-teal-600 hover:text-teal-700 mt-4 flex items-center justify-center space-x-2 py-2 bg-teal-50 rounded-lg hover:bg-teal-100"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>AI Review Summary</span>
                    </button>
                    
                    <a 
                        href={product.buyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full mt-2 flex items-center justify-center px-4 py-3 font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-900"
                    >
                        Shop Now
                        <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                </div>
            </div>

            {/* The modal is now correctly placed within the fragment */}
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
            fetch(`http://localhost:3001/public/collections/${collection.id}/view`, {
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
    
    useQuery({
        queryKey: ['followStatus', collection?.authorId, user?.id],
        queryFn: () => getFollowStatus(collection.authorId, user.id),
        enabled: !!user && !!collection,
        onSuccess: (data) => {
            if (data) setIsFollowing(data.isFollowing);
        },
    });
    

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
        } else if (collection) {
            if (isFollowing) {
                unfollowMutation.mutate({ creatorId: collection.authorId, userId: user.id });
            } else {
                followMutation.mutate({ creatorId: collection.authorId, userId: user.id });
            }
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
        if (collection && newComment.trim()) {
            commentMutation.mutate({ collectionId: collection.id, userId: user.id, text: newComment });
        }
    };

    if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    if (isError || !collection) {
        notFound();
    }

    const isLiked = likeStatus?.isLiked ?? false;

    return (
        <>
        <div className="bg-slate-50">
            <header className="py-12 px-4 text-center bg-white border-b border-slate-200">
                <div className="flex justify-center items-center mb-4"><img src={collection.authorAvatar} alt={collection.author} className="w-20 h-20 rounded-full shadow-lg" /></div>
                <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">{collection.name}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-700">A hand picked collection by <span className="font-semibold text-teal-600">{collection.author}</span></p>
                {collection.description && (<p className="mt-4 max-w-2xl mx-auto text-md text-slate-600 italic">{collection.description}</p>)}
                <div className="mt-6 flex flex-wrap justify-center items-center gap-2 sm:gap-4">
                <button onClick={handleFollow} disabled={followMutation.isPending || unfollowMutation.isPending} className="flex items-center space-x-2 px-4 py-2 bg-white border rounded-full text-slate-700 hover:bg-slate-100">
    <UserPlus className={`w-5 h-5 ${isFollowing ? 'text-green-500' : 'text-blue-500'}`} />
    <span>{isFollowing ? 'Following' : 'Follow'}</span>
</button>
                    <button onClick={handleToggleLike} disabled={likeMutation.isPending} className="flex items-center space-x-2 px-4 py-2 bg-white border rounded-full text-slate-700 hover:bg-slate-100">
                        <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'text-red-500 fill-current' : 'text-slate-500'}`} />
                        <span className="font-medium">{isLiked ? 'Liked' : 'Like'}</span>
                    </button>
                    <button onClick={handleCommentClick} className="flex items-center space-x-2 px-4 py-2 bg-white border rounded-full text-slate-700 hover:bg-slate-100">
                        <MessageCircle className="w-5 h-5 text-gray-500" />
                        <span>Comment</span>
                    </button>
                    <button onClick={handleShare} className="flex items-center space-x-2 px-4 py-2 bg-white border rounded-full text-slate-700 hover:bg-slate-100">
                            <Share2 className="w-5 h-5 text-teal-500" />
                            <span>Share</span>
                        </button>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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