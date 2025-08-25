// app/search/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { universalSearch } from '@/lib/api'; // Import our new function

// --- Sub-Components for a clean, world-class structure ---

const CreatorResultCard = ({ creator }: { creator: any }) => (
   <Link href={`/${creator.username}`} className="text-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center">
        <img 
            src={creator.profileImageUrl || `https://placehold.co/100x100/E2E8F0/475569?text=${creator.username.charAt(0).toUpperCase()}`} 
            alt={creator.username} 
            className="w-24 h-24 rounded-full" 
        />
        <p className="font-semibold text-slate-800 mt-3">{creator.username}</p>
   </Link>
);

const CollectionResultCard = ({ collection }: { collection: any }) => (
    <div className="break-inside-avoid mb-4">
        <Link href={`/${collection.user.username}/${collection.slug}`} className="block group relative">
            {/* We need a cover image for collections in the search results */}
            <div className="aspect-w-1 aspect-h-1 bg-slate-100 rounded-2xl overflow-hidden">
                 <img src={collection.coverImageUrl || 'https://placehold.co/400x300/cccccc/333333?text=No+Image'} alt={collection.name} className="w-full h-full object-cover shadow-lg hover:shadow-xl transition-shadow" />
            </div>
            <div className="mt-2">
                <h3 className="font-semibold text-sm text-slate-800 group-hover:text-teal-600">{collection.name}</h3>
                <p className="text-xs text-slate-500">by {collection.user.username}</p>
            </div>
        </Link>
    </div>
);


// --- MAIN SEARCH COMPONENT ---

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const { data: results, isLoading, isError } = useQuery({
        queryKey: ['universalSearch', query],
        queryFn: () => universalSearch(query),
        enabled: !!query,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    if (isError) return <div className="text-center text-red-500 p-12">Failed to load search results.</div>;

    const hasResults = results?.creators?.length > 0 || results?.collections?.length > 0 || results?.products?.length > 0;

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">
                Results for <span className="text-teal-600">"{query}"</span>
            </h1>

            {!hasResults && (
                <p className="text-slate-600 text-center py-12">No results found for your search.</p>
            )}

            {/* Creators Section */}
            {results?.creators?.length > 0 && (
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Creators</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {results.creators.map((creator: any) => (
                           <CreatorResultCard key={creator.id} creator={creator} />
                        ))}
                    </div>
                </section>
            )}

            {/* Collections Section */}
            {results?.collections?.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Collections</h2>
                    <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">
                        {results.collections.map((collection: any) => (
                            <CollectionResultCard key={collection.id} collection={collection} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

// This wrapper is required by Next.js to use useSearchParams
export default function SearchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchResults />
        </Suspense>
    );
}