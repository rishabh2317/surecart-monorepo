// app/(marketing)/brand-register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building, Tag, Globe, Wifi, Store, Mail, User } from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

export default function BrandRegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data = {
            brandName: formData.get('brandName'),
            category: formData.get('category'),
            presence: formData.get('presence'),
            website: formData.get('website'),
            email: formData.get('email'),
            name: formData.get('name'),
        };

        try {
            const res = await fetch(`${API_BASE_URL}/brands/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Submission failed');
            }
            router.push('/brand-register/thank-you');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-900">Partner with Stash</h1>
                    <p className="mt-2 text-lg text-slate-600">Join a curated community of brands and creators.</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Form Fields */}
                        <div>
                            <label htmlFor="brandName" className="text-sm font-medium text-slate-700">Brand Name</label>
                            <div className="relative mt-1"><Building className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="text" name="brandName" required className="w-full pl-10 pr-3 py-2 bg-slate-50 border rounded-lg" /></div>
                        </div>
                        <div>
                            <label htmlFor="category" className="text-sm font-medium text-slate-700">Category</label>
                            <div className="relative mt-1"><Tag className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="text" name="category" required placeholder="e.g., Fashion, Skincare, Tech" className="w-full pl-10 pr-3 py-2 bg-slate-50 border rounded-lg" /></div>
                        </div>
                         <div>
                            <label className="text-sm font-medium text-slate-700">Primary Presence</label>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <label className="flex items-center space-x-3 p-3 border rounded-lg has-[:checked]:bg-teal-50 has-[:checked]:border-teal-500"><Wifi className="w-5 h-5 text-teal-600" /><span className="font-medium text-slate-700">Online</span><input type="radio" name="presence" value="online" className="ml-auto" /></label>
                                <label className="flex items-center space-x-3 p-3 border rounded-lg has-[:checked]:bg-teal-50 has-[:checked]:border-teal-500"><Store className="w-5 h-5 text-teal-600" /><span className="font-medium text-slate-700">Offline</span><input type="radio" name="presence" value="offline" className="ml-auto" /></label>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="website" className="text-sm font-medium text-slate-700">Website</label>
                            <div className="relative mt-1"><Globe className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="url" name="website" required placeholder="https://..." className="w-full pl-10 pr-3 py-2 bg-slate-50 border rounded-lg" /></div>
                        </div>
                        <div className="border-t pt-6 space-y-6">
                            <p className="text-sm font-semibold text-slate-800">Your Contact Information</p>
                             <div>
                                <label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name</label>
                                <div className="relative mt-1"><User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="text" name="name" required className="w-full pl-10 pr-3 py-2 bg-slate-50 border rounded-lg" /></div>
                            </div>
                            <div>
                                <label htmlFor="email" className="text-sm font-medium text-slate-700">Work Email</label>
                                <div className="relative mt-1"><Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="email" name="email" required className="w-full pl-10 pr-3 py-2 bg-slate-50 border rounded-lg" /></div>
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <button type="submit" disabled={isLoading} className="w-full py-3 px-4 rounded-lg text-white font-semibold bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300">
                            {isLoading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}