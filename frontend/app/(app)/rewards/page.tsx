// app/(creator)/rewards/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CreatorPageHeader from '@/components/creator/CreatorPageHeader';
import { Copy, Check, Gift } from 'lucide-react';
import TransactionsDrawer from '@/components/creator/TransactionsDrawer';

// API Function
const getRewardsData = async (userId: string) => {
    const res = await fetch(`http://localhost:3001/users/${userId}/rewards`);
    if (!res.ok) throw new Error("Failed to fetch rewards");
    return res.json();
};

// --- Sub-Components for a clean structure ---
const CouponCard = ({ coupon }: { coupon: any }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(coupon.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col group transition-shadow hover:shadow-lg">
            <div className="aspect-video w-full overflow-hidden">
                <img src={coupon.imageUrl} alt={coupon.description} className="w-full h-full object-cover"/>
            </div>
            <div className="p-5 flex flex-col justify-between flex-grow">
                <div>
                    <h3 className="font-bold text-lg text-slate-800">{coupon.description}</h3>
                    <p className="text-sm text-slate-500 mt-1">Use this exclusive code at checkout</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                    <div className="border-2 border-dashed border-slate-300 rounded-lg px-4 py-2">
                        <span className="font-mono font-bold text-slate-700 tracking-widest">{coupon.code}</span>
                    </div>
                    <button 
                        onClick={handleCopy} 
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-sm ${copied ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---
export default function RewardsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        if (user && user.role !== 'CREATOR') {
            router.push('/');
        }
    }, [user, router]);

    const { data: rewards, isLoading } = useQuery({
        queryKey: ['rewards', user?.id],
        queryFn: () => getRewardsData(user.id),
        enabled: !!user,
    });

    if (isLoading || !user) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    const { wallet, coupons = [], transactions = [] } = rewards || {};

    return (
        <>
            <div className="min-h-screen bg-slate-50">
                <CreatorPageHeader title="My Rewards" />
                <main className="container mx-auto p-4 sm:p-8">
                    {/* Wallet Section */}
                    <section className="mb-12">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-8 rounded-2xl shadow-lg max-w-3xl mx-auto">
                            <p className="font-semibold text-slate-300">Available Balance</p>
                            <p className="text-5xl font-bold mt-2">
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: wallet?.currency || 'INR' }).format(wallet?.balance || 0)}
                            </p>
                            <div className="flex items-center space-x-4 mt-6">
                                <button className="bg-white text-slate-800 font-bold px-6 py-3 rounded-lg hover:bg-slate-200">
                                    Withdraw Funds
                                </button>
                                <button onClick={() => setIsDrawerOpen(true)} className="bg-transparent text-slate-300 font-semibold px-6 py-3 rounded-lg hover:bg-slate-700 transition-colors">
                                    View Transactions
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Coupons Section */}
                    <section>
                        <div className="flex items-center space-x-3 mb-6 max-w-3xl mx-auto">
                            <Gift className="w-7 h-7 text-yellow-500" />
                            <h2 className="text-2xl font-bold text-slate-900">Your Exclusive Coupons</h2>
                        </div>
                        {coupons.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                                {coupons.map((coupon: any) => <CouponCard key={coupon.id} coupon={coupon} />)}
                            </div>
                        ) : (
                            <div className="text-center py-16 border-2 border-dashed rounded-lg max-w-3xl mx-auto">
                                <p className="text-slate-600">You do not have any coupons right now.</p>
                            </div>
                        )}
                    </section>
                </main>
            </div>
            
            <TransactionsDrawer 
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                transactions={transactions}
            />
        </>
    );
}