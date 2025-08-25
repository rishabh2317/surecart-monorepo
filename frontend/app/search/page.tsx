// app/search/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
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

// THIS IS THE NEW, MISSING COMPONENT
const ProductCard = ({ product }: { product: any }) => (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
        <Link href={`/products/${product.id}`}>
            <div className="aspect-square w-full bg-slate-100 rounded-t-xl overflow-hidden">
                <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
                <p className="font-semibold text-slate-800 truncate">{product.name}</p>
                <p className="text-sm text-slate-500">{product.brand?.name || 'Brand'}</p>
            </div>
        </Link>
    </div>
);


// --- MAIN SEARCH COMPONENT ---

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    
    const { data: results, isLoading } = useQuery({
        queryKey: ['universalSearch', query],
        queryFn: () => universalSearch(query),
        enabled: !!query,
    });
    
    const { creators = [], collections = [], products = [] } = results || {};
    const [activeTab, setActiveTab] = useState('Collections');

    // This is the FIX: It sets the default active tab to the first category that has results.
    useEffect(() => {
        if (collections.length > 0) setActiveTab('Collections');
        else if (creators.length > 0) setActiveTab('Creators');
        else if (products.length > 0) setActiveTab('Products');
    }, [results]); // This runs when the results are fetched

    if (isLoading) return <div className="text-center p-12">Searching...</div>;

    const hasResults = creators.length > 0 || collections.length > 0 || products.length > 0;

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Results for <span className="text-teal-600">"{query}"</span></h1>
            
            {hasResults ? (
                <>
                    <div className="border-b border-slate-200 mb-6">
                        <nav className="-mb-px flex space-x-6">
                            {/* The tabs are now conditionally rendered */}
                            {collections.length > 0 && <button onClick={() => setActiveTab('Collections')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'Collections' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500'}`}>Collections</button>}
                            {creators.length > 0 && <button onClick={() => setActiveTab('Creators')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'Creators' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500'}`}>Creators</button>}
                            {products.length > 0 && <button onClick={() => setActiveTab('Products')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'Products' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500'}`}>Products</button>}
                        </nav>
                    </div>

                    {activeTab === 'Collections' && <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">{collections.map((c: any) => <CollectionResultCard key={c.id} collection={c} />)}</div>}
                    {activeTab === 'Creators' && <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">{creators.map((c: any) => <CreatorResultCard key={c.id} creator={c} />)}</div>}
                    {activeTab === 'Products' && <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">{products.map((p: any) => <ProductCard key={p.id} product={p} />)}</div>}
                </>
            ) : (
                <p className="text-slate-600 text-center py-12">No results found for your search.</p>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (<Suspense fallback={<div>Loading...</div>}><SearchResults /></Suspense>);
}