// app/(auth)/login/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/config';
import { Loader2 } from 'lucide-react';

// --- A simple SVG for the Google Icon ---
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C41.38,34.421,44,29.561,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);

function LoginComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, register, signInWithGoogle } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (user && user.role === 'SHOPPER' && searchParams.get('action') === 'signup') {
        router.push('/onboarding');
    }
    if (searchParams.get('action') === 'signup') {
      setIsSignUp(true);
    }
  }, [searchParams, user, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        // Get the role from the URL, defaulting to 'CREATOR' if not present
        const role = searchParams.get('role')?.toUpperCase() || 'CREATOR';
        await register({ email, password, username, role: role });
      } else {
        await login(email, password);
      }
    } catch (err: any) { setError(err.message); }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true); // Activate loader
    setError('');
      try {
          await signInWithGoogle();
      } catch (err: any) {
          setError(err.message);
          setIsGoogleLoading(false); // Deactivate loader on error
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 relative">
      {isGoogleLoading && (
        <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
            <p className="mt-4 text-slate-700 font-semibold">Redirecting you...</p>
        </div>
      )}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <Link href="/"><h1 className="text-4xl font-bold text-slate-900">Stash</h1></Link>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800">{isSignUp ? 'Create your Creator account' : 'Welcome back'}</h2>
                <p className="mt-2 text-slate-600">{isSignUp ? 'Join a community of top creators.' : 'Sign in to continue.'}</p>
            </div>
            <div>
                <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center py-3 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                    <GoogleIcon /> Continue with Google
                </button>
            </div>
            <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-300"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">Or</span></div></div>
            <form className="space-y-4" onSubmit={handleAuth}>
                {isSignUp && (<div><label className="text-sm font-medium text-slate-700">Username</label><input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /></div>)}
                <div><label className="text-sm font-medium text-slate-700">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /></div>
                <div>
                <div>
    <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-700">Password</label>
        <Link href="/forgot-password" className="text-sm font-medium text-teal-600 hover:underline">
            Forgot password?
        </Link>
    </div>
    </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /></div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                
                <button type="submit" className="w-full py-3 px-4 rounded-lg text-white font-semibold bg-teal-500 hover:bg-teal-600">{isSignUp ? 'Create Account' : 'Sign In'}</button>
            </form>
        </div>
        <div className="text-center mt-6"><button onClick={() => setIsSignUp(!isSignUp)} className="text-sm font-medium text-teal-600 hover:underline">{isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}</button></div>
      </div>
    </div>
  );
}

export default function LoginPage() {
    return (<Suspense fallback={<div>Loading...</div>}><LoginComponent /></Suspense>)
}