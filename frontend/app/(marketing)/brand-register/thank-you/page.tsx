// app/(marketing)/brand-register/thank-you/page.tsx
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function ThankYouPage() {
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-slate-900">Thank You!</h1>
                <p className="mt-4 text-lg text-slate-600">
                    Your application has been received. Our partnerships team will review your information and get in touch with you via email within the next 2-3 business days.
                </p>
                <div className="mt-8">
                    <Link href="/" className="font-semibold text-teal-600 hover:underline">
                        &larr; Back to Homepage
                    </Link>
                </div>
            </div>
        </div>
    );
}