// frontend/app/(brand)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

// A simple SVG for the Google Icon
const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C41.38,34.421,44,29.561,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
  );

export default function BrandLoginPage() {
    const router = useRouter();
    const { login, signInWithGoogle } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await login(email, password);
            // The AuthContext will handle redirecting to the brand dashboard
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };
    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError('');
        try {
            await signInWithGoogle();
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <Image src="/logo11.png" alt="Stash Logo" width={120} height={40} priority />
                    </Link>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-800">Brand Partner Login</h2>
                        <p className="mt-2 text-slate-600">Access your dashboard to manage campaigns and view analytics.</p>
                    </div>
                    {/* Google Sign-In Button */}
                    <div>
                        <button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full flex items-center justify-center py-3 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50">
                            <GoogleIcon /> Continue with Google
                        </button>
                    </div>
                    <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-300"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">Or</span></div></div>

                    <form className="space-y-4" onSubmit={handleLogin}>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Work Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" />
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 rounded-lg text-white font-semibold bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                        </button>
                    </form>
                </div>
                <div className="text-center mt-6">
                    <Link href="/brand-register" className="text-sm font-medium text-teal-600 hover:underline">
                        Don't have an account? Register your brand
                    </Link>
                </div>
            </div>
        </div>
    );
}