// components/creator/CreatorPageHeader.tsx
'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface CreatorPageHeaderProps {
    title: string;
    mainAction?: React.ReactNode;
}

export default function CreatorPageHeader({ title, mainAction }: CreatorPageHeaderProps) {
    return (
        <header className="bg-white p-4 border-b sticky top-0 z-30">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-slate-500 hover:text-slate-900">
                        <ArrowLeft/>
                    </Link>
                    <h1 className="text-xl font-bold text-slate-900">{title}</h1>
                </div>
                <div>
                    {mainAction}
                </div>
            </div>
        </header>
    );
}