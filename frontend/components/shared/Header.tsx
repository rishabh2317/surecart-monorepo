// components/shared/Header.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Search, User, Layers, Package, Loader2 } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { universalSearch } from '@/lib/api';

export default function Header() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    useEffect(() => {
        const fetchResults = async () => {
            if (debouncedSearchQuery.length > 1) {
                setIsSearching(true);
                try {
                    const data = await universalSearch(debouncedSearchQuery);
                    setResults(data);
                } catch (error) {
                    console.error("Search failed:", error);
                    setResults(null);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults(null);
            }
        };
        fetchResults();
    }, [debouncedSearchQuery]);

    const pathname = usePathname();
    
    useEffect(() => {
        // This clears the search bar when you navigate to a new page
        setSearchQuery('');
        setIsFocused(false);
    }, [pathname]); // This runs every time the page URL changes

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${searchQuery.trim()}`);
            setIsFocused(false);
        }
    };

    return (
        <>
            {/* Background Overlay */}
            {isFocused && <div className="fixed inset-0 bg-black/50 z-30" />}

            <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 gap-4">
                    <Link href="/" className="flex-shrink-0">
                        <img src="/logo2.png" alt="surecart logo" className="h-8 w-auto" />
                    </Link>
                    
                    {/* Search Component */}
                    <div ref={searchRef} className="flex-1 relative min-w-0">
                        <form onSubmit={handleSearchSubmit}>
                            <input 
                                type="search" 
                                placeholder="Search" 
                                className="w-full pl-10 pr-10 py-2 border-none bg-slate-100 rounded-full focus:ring-2 focus:ring-teal-500" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                            />
                            <button type="submit" className="absolute top-1/2 right-4 -translate-y-1/2">
                            <Search className="w-5 h-5 text-teal-500 absolute top-1/2 left-4 -translate-y-1/2" />
                            </button>
                        </form>
                        
                        {/* Search Results Dropdown */}
                        {isFocused && (
                            <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-slate-200 max-h-[70vh] overflow-y-auto">
                                {isSearching && <div className="p-4 flex items-center justify-center text-slate-500"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Searching...</div>}
                                {!isSearching && results && (
                                    <div className="p-2">
                                    {results.creators?.length > 0 && <h3 className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase">Creators</h3>}
                                    {results.creators?.map((c: any) => <Link key={c.id} href={`/${c.username}`} onClick={() => setIsFocused(false)} className="flex items-center p-3 text-slate-700 hover:bg-slate-100 rounded-lg"><User className="w-4 h-4 mr-3 text-slate-500"/>{c.username}</Link>)}

                                    {results.collections?.length > 0 && <h3 className="px-3 py-1 mt-2 text-xs font-semibold text-slate-500 uppercase">Collections</h3>}
                                    {results.collections?.map((c: any) => <Link key={c.id} href={`/${c.user.username}/${c.slug}`} onClick={() => setIsFocused(false)} className="flex items-center p-3 text-slate-700 hover:bg-slate-100 rounded-lg"><Layers className="w-4 h-4 mr-3 text-slate-500"/>{c.name}</Link>)}

                                    {results.products?.length > 0 && <h3 className="px-3 py-1 mt-2 text-xs font-semibold text-slate-500 uppercase">Products</h3>}
                                    {results.products?.map((p: any) => <Link key={p.id} href={`/search?q=${encodeURIComponent(p.name)}`} onClick={() => setIsFocused(false)} className="flex items-center p-3 text-slate-700 hover:bg-slate-100 rounded-lg"><Package className="w-4 h-4 mr-3 text-slate-500"/>{p.name}</Link>)}
                                </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex-shrink-0">
                        {!loading && ( user ? <ProfileDropdown /> : <Link href="/login" className="bg-teal-500 text-white font-semibold px-5 py-2 rounded-lg">Login</Link> )}
                    </div>
                </div>
            </header>
        </>
    );
}