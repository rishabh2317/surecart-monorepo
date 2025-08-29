// app/(shopper)/likes/page.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { API_BASE_URL } from '@/lib/config';

// API Functions
const getLikedCollections = async (userId: string) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/likes`);
    if (!res.ok) throw new Error("Failed to fetch liked collections");
    return res.json();
};

const unlikeCollection = async ({ collectionId, userId }: { collectionId: string, userId: string }) => {
    const res = await fetch(`${API_BASE_URL}/collections/${collectionId}/unlike`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error("Failed to unlike");
    return true;
};

// --- A WORLD-CLASS, REUSABLE CARD COMPONENT ---
const LikedCollectionCard = ({ collection, onUnlike }: { collection: any, onUnlike: () => void }) => {
    const coverImage = collection.coverImage || `https://placehold.co/400x300/cccccc/333333?text=${encodeURIComponent(collection.name)}`;

    return (
        <div className="break-inside-avoid mb-4 group relative">
            <Link href={`/${collection.author}/${collection.slug}`}>
                <img 
                    src={coverImage} 
                    alt={collection.name} 
                    className="w-full rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 bg-slate-200"
                />
            </Link>
            <button 
                onClick={onUnlike}
                className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Unlike this collection"
            >
                <Heart className="w-5 h-5 fill-current" />
            </button>
            <div className="mt-3">
                <h3 className="font-semibold text-slate-800">{collection.name}</h3>
                <p className="text-sm text-slate-600">by {collection.author}</p>
            </div>
        </div>
    );
};


export default function LikedCollectionsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    const { data: likedCollections = [], isLoading } = useQuery({
        queryKey: ['likedCollections', user?.id],
        queryFn: () => {
            if (!user) return Promise.resolve([]);
            return getLikedCollections(user.id);
        },
        enabled: !!user,
    });

    const unlikeMutation = useMutation({
        mutationFn: unlikeCollection,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['likedCollections', user?.id] });
        }
    });

    if (!user || isLoading) return <div className="text-center p-12">Loading...</div>;

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-xl text-slate-900 mb-6">My Liked Collections</h1>
            {likedCollections.length > 0 ? (
                <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">
                    {likedCollections.map((collection: any) => (
                        <LikedCollectionCard 
                            key={collection.id} 
                            collection={collection} 
                            onUnlike={() => unlikeMutation.mutate({ collectionId: collection.id, userId: user.id })}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <Heart className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No likes yet</h3>
                    <p className="mt-1 text-sm text-slate-500">Explore collections and click the heart to save them here.</p>
                </div>
            )}
        </div>
    );
}