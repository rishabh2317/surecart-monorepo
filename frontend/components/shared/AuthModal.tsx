// components/shared/AuthModal.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context'; // Uses the one source of truth
import { X } from 'lucide-react';

// --- A simple SVG for the Google Icon ---
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C41.38,34.421,44,29.561,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, register, signInWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        // Registers the user with a 'SHOPPER' role by default
        await register({ email, password, username, role: 'SHOPPER' });
        alert('Account created! You can now engage with collections.');
      } else {
        await login(email, password);
      }
      // The redirect is now handled by the context
    } catch (err: any) {
      setError(err.message);
    }
  };
  // This is the new handler for the Google button
  const handleGoogleSignIn = async () => {
    try {
        await signInWithGoogle();
        // The context will handle the redirect and closing the modal
    } catch (err: any) {
        setError(err.message);
    }
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
        <button onClick={closeAuthModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X />
        </button>
        <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-800">{isSignUp ? 'Join Stash' : 'Welcome Back'}</h3>
            <p className="text-slate-600 mt-2">Sign up to like, save, and follow creators.</p>
        </div>
        {/* THIS IS THE NEW GOOGLE BUTTON SECTION */}
        <div className="mt-6">
            <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center py-3 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                <GoogleIcon /> Continue with Google
            </button>
        </div>

        <div className="relative mt-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-300"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">Or</span></div></div>
        <form onSubmit={handleAuth} className="mt-6 space-y-4">
          {isSignUp && (
            <div>
              <label className="text-sm font-medium text-slate-700">Username</label>
              <input type="text" placeholder="Choose a username" value={username} onChange={e => setUsername(e.target.value)} required className="mt-1 w-full p-3 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-teal-500" />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 w-full p-3 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full p-3 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-teal-500" />
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <button type="submit" className="w-full py-3 rounded-lg text-white font-semibold bg-teal-500 hover:bg-teal-600">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm mt-6">
          <button onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-teal-600 hover:underline">
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}