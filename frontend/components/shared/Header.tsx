// components/shared/Header.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Search } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown'; // We will create this next

export default function Header() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${searchQuery.trim()}`);
        }
    };

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
            <div className="flex items-center h-16">
                {/* Logo is now flush to the left */}
                <div className="px-4">
                    <Link href="/" className="flex-shrink-0">
                        <div className="h-12 w-12 bg-teal-500 rounded-full flex items-center justify-center">
                            <img src="/logo2.png" alt="surecart logo" className="h-8 w-auto" />
                        </div>
                    </Link>
                </div>

                {/* Search Bar fills the remaining space */}
                <div className="flex-1 px-4">
                    {/* THIS IS THE FIX: The search bar is now a functional form */}
                    <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
                        <input 
                            type="search" 
                            placeholder="Search" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border-none bg-slate-100 rounded-full focus:ring-2 focus:ring-teal-500" 
                        />
                        <Search className="w-5 h-5 text-slate-500 absolute top-1/2 left-4 -translate-y-1/2" />
                    </form>
                </div>

                {/* Profile sits on the right */}
                <div className="px-4">
                    {!loading && (
                        <>
                            {user ? (
                                <ProfileDropdown />
                            ) : (
                                <Link href="/login" className="bg-teal-500 text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-teal-600">
                                    Login
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>
        </header>
    );
 }