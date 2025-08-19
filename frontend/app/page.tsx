// app/page.tsx
'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

async function getHomepageFeed() {
    const res = await fetch(`http://localhost:3001/public/home`);
    if (!res.ok) return [];
    return res.json();
}

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

export default function HomePage() {
    const { data: collections = [], isLoading } = useQuery({ queryKey: ['homepageFeed'], queryFn: getHomepageFeed });

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            {isLoading ? <div className="text-center">Loading feed...</div> : (
                <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">
                    {collections.map((col: any) => <CollectionCard key={col.id} collection={col} />)}
                </div>
            )}
        </div>
    );
}