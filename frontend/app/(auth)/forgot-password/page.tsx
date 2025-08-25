// app/(auth)/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would call your /auth/forgot-password endpoint
        setMessage('If an account with that email exists, a reset link has been sent.');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-800">Reset your password</h2>
                        <p className="mt-2 text-slate-600">Enter your email and we'll send you a link to get back into your account.</p>
                    </div>
                    {message ? (
                        <p className="text-center p-4 bg-green-50 text-green-700 rounded-lg">{message}</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Email</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 w-full p-3 border rounded-lg" />
                            </div>
                            <button type="submit" className="w-full py-3 rounded-lg text-white bg-teal-500 hover:bg-teal-600">Send Reset Link</button>
                        </form>
                    )}
                </div>
                <div className="text-center mt-6">
                    <Link href="/login" className="text-sm font-medium text-teal-600 hover:underline">&larr; Back to Login</Link>
                </div>
            </div>
        </div>
    );
}