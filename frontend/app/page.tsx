'use client';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/lib/config';
import { Heart, MessageCircle, Share2, MoreHorizontal, Star, Eye } from 'lucide-react';
import { useMemo, useState } from 'react';
import {  
  likeCollection, 
  unlikeCollection,
  followCreator,
  unfollowCreator,
  getFeedInteractionStatus 
} from '@/lib/api';
import ShareModal from '@/components/shared/ShareModal';
import { useAuth } from '@/lib/auth-context';

async function getHomepageFeed() {
    const res = await fetch(`${API_BASE_URL}/public/home`);
    if (!res.ok) return [];
    return res.json();
}

// A small, sleek product card for the horizontal row
const ProductPreviewCard = ({ product }: { product: any }) => (
  <div className="w-32 flex-shrink-0">
      <a href={product.shopUrl} target="_blank" rel="noopener noreferrer" className="block bg-white rounded-lg p-2 shadow-sm border border-slate-200">
          <div className="aspect-square w-full rounded-md overflow-hidden bg-slate-100">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="mt-2">
              <p className="text-xs font-bold text-slate-800 truncate">{product.brand}</p>
              <p className="text-xs text-slate-500 truncate">{product.name}</p>
              <div className="flex items-center space-x-1 mt-1">
                  {product.price && <p className="text-xs font-semibold text-slate-900">₹{product.price}</p>}
                  {product.discountPercentage && <p className="text-xs text-red-500 font-semibold">{product.discountPercentage}% OFF</p>}
              </div>
              {product.rating && (
                  <div className="flex items-center space-x-1 mt-1 text-xs text-slate-500">
                      <Star className="w-3 h-3 text-amber-400 fill-current" />
                      <span>{product.rating}</span>
                  </div>
              )}
          </div>
      </a>
  </div>
);


// A component to handle the media carousel
const MediaCarousel = ({ media }: { media: any[] }) => {
    // For now, this just shows the first image. It can be upgraded later
    // to a full carousel with libraries like Swiper.js.
    const firstMedia = media[0];

    if (!firstMedia) return <div className="aspect-square w-full bg-slate-200" />;

    if (firstMedia.type === 'video') {
        return (
            <div className="aspect-square w-full">
                <video src={firstMedia.url} className="w-full h-full object-cover" controls />
            </div>
        );
    }

    return (
        <div className="aspect-square w-full">
            <img src={firstMedia.url} alt="Collection media" className="w-full h-full object-cover" />
        </div>
    );
};


// The main PostCard component, styled like Instagram
const PostCard = ({ collection }: { collection: any }) => {
  const { user, openAuthModal } = useAuth();
    const queryClient = useQueryClient();
    const [showShareModal, setShowShareModal] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    
    // State for local, optimistic updates
    const [isLiked, setIsLiked] = useState(collection.isLiked);
    const [likesCount, setLikesCount] = useState(collection.likes);
    const [isFollowing, setIsFollowing] = useState(collection.isFollowing);

    const pageUrl = typeof window !== 'undefined' ? `${window.location.origin}/${collection.author}/${collection.slug}` : '';

    const likeMutation = useMutation({
      mutationFn: () => {
          if (!user) throw new Error("Not logged in");
          const payload = { collectionId: collection.id, userId: user.id };
          // If it is currently liked, we should call 'unlike'.
          return isLiked ? unlikeCollection(payload) : likeCollection(payload);
      },
      onMutate: async () => {
          await queryClient.cancelQueries({ queryKey: ['homepageFeed'] });
          const previousState = isLiked;
          setIsLiked(!previousState);
          setLikesCount((prev: number) => !previousState ? prev + 1 : prev - 1);
          return { previousState };
      },
      onError: (err, variables, context) => {
          // Revert on error
          if (context?.previousState !== undefined) {
              setIsLiked(context.previousState);
              setLikesCount((prev: number) => context.previousState ? prev + 1 : prev - 1);
          }
      },
      onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ['homepageFeed'] });
      }
  });

  const followMutation = useMutation({
    mutationFn: () => {
        if (!user) throw new Error("Not logged in");
        const payload = { creatorId: collection.authorId, userId: user.id };
        return isFollowing ? unfollowCreator(payload) : followCreator(payload);
    },
    onMutate: async () => {
        const previousState = isFollowing;
        setIsFollowing(!previousState);
        return { previousState };
    },
    onError: (err, variables, context) => {
        if (context?.previousState !== undefined) setIsFollowing(context.previousState);
    },
    onSettled: () => {
         queryClient.invalidateQueries({ queryKey: ['homepageFeed'] });
    }
});



    const handleLikeClick = () => {
        if (!user) {
            openAuthModal(`/${collection.author}/${collection.slug}`);
        } else {
            likeMutation.mutate();
        }
    };

    const handleFollowClick = () => {
      if (!user) openAuthModal(`/${collection.author}`);
      else followMutation.mutate();
  }
  return (
      <>
          <div className="bg-white mb-8">
              {/* Post Header */}
              <div className="flex sm:hidden items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                      <img src={collection.authorAvatar} alt={collection.author} className="w-8 h-8 rounded-full" />
                      <Link href={`/${collection.author}`} className="font-bold text-sm text-slate-800 hover:underline">{collection.author}</Link>
                  </div>
                  {/* Hide follow button if viewing your own post */}
                  {user?.id !== collection.authorId && (
                        <button onClick={handleFollowClick} disabled={followMutation.isPending} className={`text-sm font-bold ${isFollowing ? 'text-slate-500' : 'text-teal-500'}`}>
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    )}
              </div>

              {/* Main Media */}
              <MediaCarousel media={collection.media} />
              
              {/* Horizontal Product Row */}
              {collection.products && collection.products.length > 0 && (
                    <div className="flex space-x-3 overflow-x-auto p-3"><div className="font-bold text-sm text-slate-800 self-center pr-2">Shop The Look</div>
                        {collection.products.map((product: any) => <ProductPreviewCard key={product.id} product={product} />)}
                    </div>
                )}
              
              {/* NEW Action Bar at the bottom */}
              <div className="p-3 flex items-center justify-between border-t border-slate-100">
                  <div className="flex items-center space-x-4">
                  <button onClick={handleLikeClick} className="flex items-center space-x-2 text-slate-700 hover:text-red-500">
                            <Heart className={`w-6 h-6 ${isLiked ? 'text-red-500 fill-current' : ''}`} />
                            <span className="font-semibold text-sm">{likesCount.toLocaleString()}</span>
                        </button>
                      <button onClick={() => setShowShareModal(true)} className="flex items-center space-x-2 text-slate-700 hover:text-teal-500"><Share2 className="w-6 h-6" /></button>
                      <div className="flex items-center space-x-2 text-slate-700">
                        <Eye className="w-6 h-6"/>
                        <span className="font-semibold text-sm">{collection.views.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <Link href={`/${collection.author}/${collection.slug}`} className="bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg text-sm">Shop All</Link>
              </div>
              
              {/* Engagement Stats */}
              <div className="px-3 pb-3">
                    <Link href={`/${collection.author}/${collection.slug}`} className="font-bold text-sm text-slate-800 hover:underline">
                        {collection.name}
                    </Link>
                    {collection.description && (
                        <>
                            <p className={`text-sm text-slate-700 mt-1 ${!isExpanded && 'line-clamp-2'}`}>
                                {collection.description}
                            </p>
                            {collection.description.length > 100 && (
                                <button onClick={() => setIsExpanded(!isExpanded)} className="text-sm text-slate-500 font-semibold mt-1">
                                    {isExpanded ? '...see less' : 'see more'}
                                </button>
                            )}
                        </>
                    )}
                </div>
          </div>
          {/* The ShareModal is now connected */}
          <ShareModal url={pageUrl} isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
      </>
  );
};
  

export default function HomePage() {
  const { user } = useAuth();
  const { data: collections = [], isLoading } = useQuery({ 
      queryKey: ['homepageFeed'], 
      queryFn: getHomepageFeed 
  });

  const { data: interactionStatus } = useQuery({
      queryKey: ['feedInteractionStatus', collections.map((c:any) => c.id), user?.id],
      queryFn: () => getFeedInteractionStatus(collections.map((c:any) => c.id), user!.id),
      enabled: !!user && collections.length > 0,
  });

  const collectionsWithStatus = useMemo(() => {
      if (!interactionStatus) return collections;
      return collections.map((col: any) => ({
          ...col,
          isLiked: interactionStatus[col.id]?.isLiked || false,
      }));
  }, [collections, interactionStatus]);

  return (
      <div className="w-full max-w-lg mx-auto sm:py-8">
          {isLoading ? <div className="text-center">Loading feed...</div> : (
              <div>
                  {collectionsWithStatus.map((col: any) => <PostCard key={col.id} collection={col} />)}
              </div>
          )}
      </div>
  );
}