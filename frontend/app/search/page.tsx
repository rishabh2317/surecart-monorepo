'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/config'; // your existing config
import clsx from 'clsx';


/* ---------- helpers ---------- */

// simple debounce hook (if needed elsewhere)
function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// highlight matched terms in text (client-side). Escapes regex chars.
function highlight(text: string, q: string) {
  if (!q) return text;
  const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${esc})`, 'ig');
  return text.replace(re, '<mark class="bg-yellow-200 text-yellow-900 rounded py-0 px-0">$1</mark>');
}

/* ---------- API helper ---------- */

async function fetchSearch(q: string, page = 1, limit = 12) {
  const url = `${API_BASE_URL}/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Search failed: ${res.status} ${body}`);
  }
  return res.json();
}

/* ---------- Result Card components ---------- */

const CreatorCard = ({ creator, q }: { creator: any; q: string }) => (
  <Link href={`/${creator.username}`} className="text-center p-4 bg-white rounded-xl shadow hover:shadow-lg transition">
    <img src={creator.profileImageUrl || `https://placehold.co/100x100/E2E8F0/475569?text=${creator.username.charAt(0).toUpperCase()}`} alt={creator.username} className="w-20 h-20 rounded-full mx-auto" />
    <p className="font-semibold text-slate-800 mt-3" dangerouslySetInnerHTML={{ __html: highlight(creator.username, q) }} />
  </Link>
);

const CollectionCard = ({ collection, q }: { collection: any; q: string }) => (
  <div className="break-inside-avoid mb-4">
    <Link href={`/${collection.ownerUsername}/${collection.slug}`} className="block group relative">
      <div className="aspect-w-1 aspect-h-1 bg-slate-100 rounded-2xl overflow-hidden">
        <img src={collection.coverImageUrl || 'https://placehold.co/400x300/cccccc/333333?text=No+Image'} alt={collection.name} className="w-full h-full object-cover" />
      </div>
      <div className="mt-2">
        <h3 className="font-semibold text-sm text-slate-800 group-hover:text-teal-600" dangerouslySetInnerHTML={{ __html: highlight(collection.name, q) }} />
        <p className="text-xs text-slate-500">by {collection.ownerUsername}</p>
      </div>
    </Link>
  </div>
);

/* ---------- Main Page ---------- */

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const q = searchParams?.get('q') || '';
  const debouncedQ = useDebounce(q, 250);

  // infinite query
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['universalSearch', debouncedQ],
    queryFn: ({ pageParam = 1 }) => fetchSearch(debouncedQ, pageParam as number, 12),
    initialPageParam: 1, // 👈 REQUIRED in v5
    enabled: !!debouncedQ,
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage) return undefined;
      const { products = [], collections = [], creators = [], limit } = lastPage;
  
      const returned =
        (products.length || 0) +
        (collections.length || 0) +
        (creators.length || 0);
  
      if (returned < (limit || 12)) return undefined;
      return pages.length + 1;
    },
    staleTime: 1000 * 30,
  });
  
  

  // IntersectionObserver for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });
    });
    io.observe(loadMoreRef.current);
    return () => io.disconnect();
  }, [loadMoreRef.current, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Merge pages
  const results = useMemo(() => {
    if (!data) return { creators: [], collections: [], products: [] };
    const creators: any[] = data.pages.flatMap(p => p.creators || []);
    const collections: any[] = data.pages.flatMap(p => p.collections || []);
    const products: any[] = data.pages.flatMap(p => p.products || []);
    return { creators, collections, products };
  }, [data]);

  if (!q) {
    return (
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-bold">Start typing to search</h2>
        <p className="text-slate-600 mt-2">Search creators, collections and products.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (isError) {
    return <div className="text-center text-red-500 p-12">Failed to load search results.</div>;
  }

  const hasAny = results.creators.length || results.collections.length || results.products.length;

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Results for <span className="text-teal-600">{q}</span>
      </h1>

      {!hasAny && <p className="text-center text-slate-600 py-12">No results found</p>}

      {results.creators.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Creators</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {results.creators.map((c:any) => <CreatorCard key={c.id} creator={c} q={q} />)}
          </div>
        </section>
      )}

      {results.collections.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Collections</h2>
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">
            {results.collections.map((col:any) => <CollectionCard key={col.id} collection={col} q={q} />)}
          </div>
        </section>
      )}

      {/* Products could be displayed in a row or masonry; I show a grid */}
      {results.products.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.products.map((p:any) => (
              <div key={p.id} className="bg-white rounded-xl p-3 shadow">
                <div className="h-40 mb-3 rounded overflow-hidden bg-slate-100">
                  <img src={(p.imageUrls && p.imageUrls[0]) || 'https://placehold.co/400x300/cccccc/333333?text=No+Image'} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-semibold text-sm" dangerouslySetInnerHTML={{ __html: highlight(p.name || '', q) }} />
                <p className="text-xs text-slate-500 mt-1">{p.brandName || ''}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Loader sentinel */}
      <div ref={loadMoreRef} className="h-8 flex items-center justify-center">
        {isFetchingNextPage ? <div className="text-sm text-slate-500">Loading more...</div> : hasNextPage ? <div className="text-sm text-slate-400">Scroll to load more</div> : <div className="text-sm text-slate-400">No more results</div>}
      </div>
    </div>
  );
}
