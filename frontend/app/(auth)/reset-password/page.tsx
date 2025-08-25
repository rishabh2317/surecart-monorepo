// app/(auth)/reset-password/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        // In a real app, this would call your /auth/reset-password endpoint
        setMessage("Your password has been successfully reset!");
        setError('');
        setTimeout(() => router.push('/login'), 2000);
    };

    return (
         <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-800">Create a new password</h2>
                        <p className="mt-2 text-slate-600">Your new password must be different from previous passwords.</p>
                    </div>
                    {message ? (
                         <p className="text-center p-4 bg-green-50 text-green-700 rounded-lg">{message}</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">New Password</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full p-3 border rounded-lg" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 w-full p-3 border rounded-lg" />
                            </div>
                            {error && <p className="text-sm text-red-600">{error}</p>}
                            <button type="submit" className="w-full py-3 rounded-lg text-white bg-teal-500 hover:bg-teal-600">Reset Password</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}


export default function ResetPasswordPage() {
    return (<Suspense fallback={<div>Loading...</div>}><ResetPasswordComponent /></Suspense>);
}