// components/shared/AskAIDrawer.tsx
'use client';

import { useMutation } from '@tanstack/react-query';
import { X, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { API_BASE_URL } from '@/lib/config';

// API Function
const getAiSummary = async (productName: string) => {
    const res = await fetch(`${API_BASE_URL}/products/ask-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName }),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to get AI summary");
    }
    return res.json();
};

interface AskAIDrawerProps {
    productName: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function AskAIDrawer({ productName, isOpen, onClose }: AskAIDrawerProps) {
    const { data, mutate, isPending, isError, error } = useMutation({
        mutationFn: getAiSummary,
    });

    useEffect(() => {
        if (isOpen && !data) { // Only fetch if the drawer is open and we don't have data yet
            mutate(productName);
        }
    }, [isOpen, productName, mutate, data]);
    
    return (
        <>
            {/* Overlay */}
            <div 
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>
            
            {/* Drawer */}
            <div 
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform ease-in-out duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    <header className="p-4 border-b flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center space-x-3">
                            <Sparkles className="w-6 h-6 text-teal-500" />
                            <h2 className="text-xl font-bold text-slate-800">AI Review Summary</h2>
                        </div>
                        <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><X /></button>
                    </header>
                    <div className="overflow-y-auto p-6 flex-grow">
                        <p className="font-semibold text-slate-700 mb-4">{productName}</p>
                        <div className="text-slate-700 space-y-4">
    {isPending && <p>Generating summary...</p>}
    {isError && <p className="text-red-500">Error: {error.message}</p>}
    {data && (
        <div 
            className="prose prose-slate max-w-none" 
            dangerouslySetInnerHTML={{ 
                __html: data.summary
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
                    .replace(/\*/g, '') // Remove stray asterisks
                    .replace(/- (.*?)(?=\n|$)/g, '<li class="ml-4">$1</li>') // List items
                    .replace(/\n/g, '<br />')
            }} 
        />
    )}
</div>
                    </div>
                    <footer className="p-4 border-t text-center text-xs text-slate-400 flex-shrink-0">
                        AI-generated summary. May not be 100% accurate.
                    </footer>
                </div>
            </div>
        </>
    );
}