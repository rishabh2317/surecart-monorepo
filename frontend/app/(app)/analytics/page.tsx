// app/(creator)/analytics/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ArrowUpRight, MousePointerClick, Heart, Save, Users, Share2, UserPlus, Eye } from 'lucide-react';
import CreatorPageHeader from '@/components/creator/CreatorPageHeader';

// --- API Function ---
const getAnalyticsData = async (userId: string) => {
    const res = await fetch(`http://localhost:3001/dashboard/${userId}/analytics`);
    if (!res.ok) throw new Error("Failed to fetch analytics");
    return res.json();
};

// --- Sub-Components for a clean structure ---
const StatCard = ({ title, value, icon: Icon }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-600">{title}</p><Icon className="w-5 h-5 text-slate-400" /></div>
        <p className="mt-2 text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
    </div>
);

// --- MAIN PAGE ---
export default function AnalyticsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [primaryMetric, setPrimaryMetric] = useState('Engagements');

    useEffect(() => {
        if (user && user.role !== 'CREATOR') router.push('/');
    }, [user, router]);

    const { data: analytics, isLoading } = useQuery({
        queryKey: ['analytics', user?.id],
        queryFn: () => getAnalyticsData(user.id),
        enabled: !!user,
    });

    if (isLoading || !user) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    const { summary, performanceOverTime, topCollections } = analytics || {};

    return (
        <div className="min-h-screen bg-slate-50">
            <CreatorPageHeader title="Analytics" />
            <main className="container mx-auto p-4 sm:p-8">
                {/* Summary Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
                    <StatCard title="Collection Views" value={summary?.totalAudience || 0} icon={Eye} />
                    <StatCard title="Engagements" value={summary?.engagements || 0} icon={ArrowUpRight} />
                    <StatCard title="Outbound Clicks" value={summary?.totalClicks || 0} icon={MousePointerClick} />
                    <StatCard title="Saves" value={summary?.saves || 0} icon={Save} />
                    <StatCard title="Likes" value={summary?.totalLikes || 0} icon={Heart} />
                    <StatCard title="Followers" value={summary?.followers || 0} icon={UserPlus} />
                </div>

                {/* Main Performance Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">Performance over time</h2>
        {/* --- THIS IS THE NEW FILTER UI --- */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg mt-2 sm:mt-0">
            <button onClick={() => setPrimaryMetric('Engagements')} className={`px-3 py-1 text-sm font-semibold rounded-md ${primaryMetric === 'Engagements' ? 'bg-teal-100 shadow-sm text-slate-800' : 'text-slate-600'}`}>Engagements</button>
            <button onClick={() => setPrimaryMetric('Clicks')} className={`px-3 py-1 text-sm font-semibold rounded-md ${primaryMetric === 'Clicks' ? 'bg-teal-100 shadow-sm text-slate-800' : 'text-slate-600'}`}>Outbound Clicks</button>
            <button onClick={() => setPrimaryMetric('Likes')} className={`px-3 py-1 text-sm font-semibold rounded-md ${primaryMetric === 'Likes' ? 'bg-teal-100 shadow-sm text-slate-800' : 'text-slate-600'}`}>Saves (Likes)</button>
        </div>
    </div>
    <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
            <LineChart data={performanceOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }} />
                {/* This line now dynamically uses the selected metric */}
                <Line type="monotone" dataKey={primaryMetric} stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
            </LineChart>
        </ResponsiveContainer>
    </div>
</div>

                {/* Top Collections Table */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Top Collections</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-semibold text-slate-500 border-b uppercase">
                                    <th className="p-3">Collection</th>
                                    <th className="p-3 text-right">Clicks</th>
                                    <th className="p-3 text-right">Likes</th>
                                    <th className="p-3 text-right">Shares (Simulated)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topCollections?.map((col: any) => (
                                    <tr key={col.id} className="border-b last:border-b-0">
                                        <td className="p-3 font-medium text-slate-800">{col.name}</td>
                                        <td className="p-3 text-right text-slate-600">{col.clicks.toLocaleString()}</td>
                                        <td className="p-3 text-right text-slate-600">{col.likes.toLocaleString()}</td>
                                        <td className="p-3 text-right text-slate-600">{col.shares.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}