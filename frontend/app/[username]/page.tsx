// app/[username]/page.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Import query hooks
import { useParams, notFound } from 'next/navigation';
import { getCreatorProfile, getFollowStatus, followCreator, unfollowCreator } from '@/lib/api'; // Import new API functions
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';

// --- Sub-Components for a clean structure ---
const CollectionCard = ({ collection }: { collection: any }) => (
    <div className="break-inside-avoid mb-4">
        <Link href={`/${collection.author}/${collection.slug}`} className="block group relative">
            <img 
                src={collection.coverImage} 
                alt={collection.name} 
                className="w-full rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl">
                <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="font-semibold text-white text-sm leading-tight">{collection.name}</h3>
                </div>
            </div>
        </Link>
    </div>
);

// --- MAIN PAGE ---
export default function CreatorProfilePage() {
    const params = useParams();
    const { user, openAuthModal } = useAuth();
    const queryClient = useQueryClient();
    const username = params.username as string;

    const { data: creator, isLoading, isError } = useQuery({
        queryKey: ['creatorProfile', username],
        queryFn: () => getCreatorProfile(username),
        enabled: !!username,
    });
    
    // --- START: NEW "SMART" FOLLOW LOGIC ---
    const { data: followStatus } = useQuery({
        queryKey: ['followStatus', creator?.id, user?.id],
        queryFn: () => getFollowStatus(creator!.id, user!.id),
        enabled: !!user && !!creator,
    });

    const isFollowing = followStatus?.isFollowing ?? false;

    const followMutation = useMutation({
        mutationFn: followCreator,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['followStatus', creator?.id, user?.id] });
            queryClient.invalidateQueries({ queryKey: ['creatorProfile', username] }); // Refreshes follower count
        },
    });

    const unfollowMutation = useMutation({
        mutationFn: unfollowCreator,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['followStatus', creator?.id, user?.id] });
            queryClient.invalidateQueries({ queryKey: ['creatorProfile', username] }); // Refreshes follower count
        },
    });
    
    const handleFollow = () => {
        if (!user) {
            openAuthModal();
        } else if (creator) {
            if (isFollowing) {
                unfollowMutation.mutate({ creatorId: creator.id, userId: user.id });
            } else {
                followMutation.mutate({ creatorId: creator.id, userId: user.id });
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    if (isError || !creator) {
        return notFound();
    }
    const isFollowActionPending = followMutation.isPending || unfollowMutation.isPending;


    return (
        <div className="bg-white">
            <main>
                {/* --- Creator Profile Header --- */}
                <section className="text-center py-12 border-b border-slate-200">
                    <div className="container mx-auto px-4">
                        <img 
                            src={creator.profileImageUrl || `https://placehold.co/100x100/E2E8F0/475569?text=${creator.username.charAt(0).toUpperCase()}`} 
                            alt={creator.username} 
                            className="w-24 h-24 rounded-full mx-auto shadow-lg" 
                        />
                        <h1 className="mt-4 text-4xl font-extrabold text-slate-900 tracking-tight">
                            {creator.fullName || creator.username}
                        </h1>
                        <p className="mt-2 text-slate-600">@{creator.username}</p>
                        
                        {creator.bio && (
                            <p className="mt-4 max-w-xl mx-auto text-md text-slate-700">
                                {creator.bio}
                            </p>
                        )}

                        <div className="mt-6 flex justify-center items-center space-x-6">
                            <div className="text-center">
                                <p className="font-bold text-xl text-slate-800">{creator._count.followers.toLocaleString()}</p>
                                <p className="text-sm text-slate-500">Followers</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-xl text-slate-800">{creator.collections.length}</p>
                                <p className="text-sm text-slate-500">Collections</p>
                            </div>
                        </div>

                        <div className="mt-6">
                        <button 
                                onClick={handleFollow} 
                                disabled={isFollowActionPending}
                                className={`flex items-center justify-center mx-auto space-x-2 px-6 py-3 font-semibold rounded-full transition-colors w-32 ${
                                    isFollowing 
                                        ? 'bg-slate-200 text-slate-800' 
                                        : 'bg-teal-500 text-white hover:bg-teal-600'
                                } disabled:bg-slate-300`}
                            >
                                <UserPlus className="w-5 h-5" />
                                <span>{isFollowing ? 'Following' : 'Follow'}</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* --- Creator's Collections Grid --- */}
                <section className="bg-slate-50 py-12">
                    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                        {creator.collections.length > 0 ? (
                             <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">
                                {creator.collections.map((col: any) => <CollectionCard key={col.id} collection={col} />)}
                            </div>
                        ) : (
                            <p className="text-center text-slate-600">This creator has not published any collections yet.</p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}