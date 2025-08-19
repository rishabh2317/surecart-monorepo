// components/shared/AppNavigation.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Home, Compass, PlusSquare, Heart } from 'lucide-react';
import { usePathname } from 'next/navigation';

const NavLink = ({ href, icon: Icon, text }: any) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link href={href} className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${isActive ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Icon className="w-6 h-6 flex-shrink-0" />
            {/* This text is now controlled by the parent's group-hover state */}
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">{text}</span>
        </Link>
    );
};

const MobileNavLink = ({ href, icon: Icon, text }: any) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link href={href} className={`flex flex-col items-center justify-center flex-1 transition-colors ${isActive ? 'text-teal-500' : 'text-slate-600'}`}>
            <Icon className="w-6 h-6" />
            <span className="text-xs mt-1">{text}</span>
        </Link>
    );
};

export default function AppNavigation() {
    const { user } = useAuth();

    const navItems = [
        { href: '/', icon: Home, text: 'Home' },
        { href: '/explore', icon: Compass, text: 'Explore' },
    ];

    if (user) {
        if (user.role === 'CREATOR') {
            navItems.push({ href: '/collections/new', icon: PlusSquare, text: 'Create' });
        } else {
            navItems.push({ href: '/likes', icon: Heart, text: 'Liked' });
        }
    }

    return (
        <>
            {/* Desktop Sidebar with hover effect */}
            <aside className="hidden sm:block w-16 hover:w-64 bg-white p-3 flex-shrink-0 transition-all duration-300 group overflow-hidden">
                <nav className="space-y-2">
                    {navItems.map(item => <NavLink key={item.href} {...item} />)}
                </nav>
            </aside>

            {/* Mobile Bottom Bar */}
            <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t h-16 flex items-center justify-around z-50">
                {navItems.map(item => <MobileNavLink key={item.href} {...item} />)}
            </nav>
        </>
    );
}