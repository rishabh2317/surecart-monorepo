// app/explore/page.tsx
'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useQuery } from '@tanstack/react-query';
import { Heart, Zap, Clock } from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

// API Functions
async function getExploreData() {
    const res = await fetch(`${API_BASE_URL}/public/explore`);
    if (!res.ok) return { new: [], trending: [] };
    return res.json();
}
async function getLikedCollections(userId: string) {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/likes`);
    if (!res.ok) return [];
    return res.json();
}

// Sub Components
const CollectionCard = ({ collection }: { collection: any }) => (
    <div className="break-inside-avoid mb-4">
        <Link href={`/${collection.author}/${collection.slug}`} className="block group relative">
            <img src={collection.coverImage} alt={collection.name} className="w-full rounded-2xl shadow-lg" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                <div className="absolute bottom-0 left-0 p-4"><h3 className="font-semibold text-white text-sm">{collection.name}</h3></div>
            </div>
        </Link>
    </div>
);

const LikedCollectionsSection = ({ userId }: { userId: string }) => {
    const { data: likedCollections = [], isLoading } = useQuery({
        queryKey: ['likedCollections', userId],
        queryFn: () => getLikedCollections(userId),
    });
    if (isLoading || likedCollections.length === 0) return null;
    return (
        <section className="mb-12">
            <div className="flex items-center space-x-3 mb-6"><Heart className="w-7 h-7 text-red-500" /><h3 className="text-xl text-slate-900">Your Liked Collections</h3></div>
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">{likedCollections.map((col: any) => <CollectionCard key={col.id} collection={col} />)}</div>
        </section>
    );
};

// Main Page
export default function ExplorePage() {
    const { user } = useAuth();
    const { data: exploreData, isLoading } = useQuery({ queryKey: ['exploreData'], queryFn: getExploreData });
    const newCollections = exploreData?.new || [];
    const trendingCollections = exploreData?.trending || [];

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl text-slate-900 mb-8">Explore</h1>
            {user && user.role === 'SHOPPER' && <LikedCollectionsSection userId={user.id} />}
            {isLoading ? <div>Loading...</div> : (
                <div className="space-y-12">
                    <section>
                        <div className="flex items-center space-x-3 mb-6"><Zap className="w-7 h-7 text-yellow-500" /><h3 className="text-xl text-slate-900">Trending Now</h3></div>
                        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">{trendingCollections.map((col: any) => <CollectionCard key={col.id} collection={col} />)}</div>
                    </section>
                    <section>
                        <div className="flex items-center space-x-3 mb-6"><Clock className="w-7 h-7 text-blue-500" /><h3 className="text-xl text-slate-900">Newest Collections</h3></div>
                        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">{newCollections.map((col: any) => <CollectionCard key={col.id} collection={col} />)}</div>
                    </section>
                </div>
            )}
        </div>
    );
}