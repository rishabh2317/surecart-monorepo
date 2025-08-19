// components/shared/ProfileDropdown.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ChevronDown, LogOut, Heart, Gift, PlusCircle, LayoutGrid } from 'lucide-react';

export default function ProfileDropdown() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2">
                <img src={user.profileImageUrl || `https://placehold.co/100x100/E2E8F0/475569?text=${user.username.charAt(0).toUpperCase()}`} alt="Profile" className="w-8 h-8 rounded-full" />
                <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2">
                    <div className="px-4 py-3 border-b">
                        <div className="flex items-center space-x-3">
                            <img src={user.profileImageUrl || `https://placehold.co/100x100/E2E8F0/475569?text=${user.username.charAt(0).toUpperCase()}`} alt="Profile" className="w-10 h-10 rounded-full" />
                            <div>
                                <p className="font-semibold text-slate-800">{user.username}</p>
                                <p className="text-sm text-slate-500 truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>
                    <div className="py-2">
                        {/* --- THIS IS THE NEW, ROLE-BASED LOGIC --- */}
                        
                        {/* Dashboard Link (for Creators and Brands) */}
                        {(user.role === 'CREATOR' || user.role === 'BRAND') && (
                            <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-100">
                                <LayoutGrid className="w-5 h-5 mr-3 text-teal-500" />
                                My Dashboard
                            </Link>
                        )}
                        {/* ADD THIS NEW LINK COMPONENT */}
                        {user.role === 'CREATOR' && (
                            <Link href="/rewards" onClick={() => setIsOpen(false)} className="flex items-center w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-100">
                                <Gift className="w-5 h-5 mr-3 text-yellow-500" />
                                Rewards
                            </Link>
                        )}
                        
                        {/* Liked Collections Link (for Creators and Shoppers) */}
                        {(user.role === 'CREATOR' || user.role === 'SHOPPER') && (
                             <Link href="/likes" onClick={() => setIsOpen(false)} className="flex items-center w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-100">
                                <Heart className="w-5 h-5 mr-3 text-red-500" />
                                Liked Collections
                            </Link>
                        )}

                        {/* Become a Creator Link (for Shoppers only) */}
                        {user.role === 'SHOPPER' && (
                            <Link href="/onboarding" onClick={() => setIsOpen(false)} className="flex items-center w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-100">
                                <PlusCircle className="w-5 h-5 mr-3 text-teal-500" />
                                Become a Creator
                            </Link>
                        )}
                    </div>
                    <div className="border-t pt-2">
                        <button onClick={() => { logout(); setIsOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-slate-700 hover:bg-slate-100">
                            <LogOut className="w-5 h-5 mr-3" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}