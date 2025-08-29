// frontend/app/(brand)/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MousePointerClick, Layers, Users, Sparkles, Package, Crown, CheckCircle, XCircle, Plus } from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

// --- API Functions ---
const getBrandOverview = async (brandId: string) => {
    const res = await fetch(`${API_BASE_URL}/brands/${brandId}/dashboard/overview`);
    if (!res.ok) throw new Error("Failed to fetch brand overview");
    return res.json();
};
const getBrandCampaigns = async (brandId: string) => {
    const res = await fetch(`${API_BASE_URL}/brands/${brandId}/campaigns`);
    if (!res.ok) throw new Error("Failed to fetch campaigns");
    return res.json();
};
const getBrandProducts = async (brandId: string) => {
    const res = await fetch(`${API_BASE_URL}/brands/${brandId}/products/performance`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
};
const getBrandCreators = async (brandId: string) => {
    const res = await fetch(`${API_BASE_URL}/brands/${brandId}/creators`);
    if (!res.ok) throw new Error("Failed to fetch creators");
    return res.json();
};
// --- Sub-Components ---
const StatCard = ({ title, value, icon: Icon }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <Icon className="w-5 h-5 text-slate-400" />
    </div>
    <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
  </div>
);

const TabButton = ({ label, activeTab, setActiveTab }: any) => (
    <button onClick={() => setActiveTab(label)} className={`px-4 py-2 font-semibold rounded-lg ${activeTab === label ? 'bg-teal-500 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>
        {label}
    </button>
);

// --- Tabs ---Tabs

const OverviewTab = ({ data }: any) => (
    <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Clicks Driven" value={data.summary.totalClicks} icon={MousePointerClick} />
            <StatCard title="Collection Features" value={data.summary.totalCollections} icon={Layers} />
            <StatCard title="Unique Creators" value={data.summary.totalCreators} icon={Users} />
        </div>
        
        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-bold text-lg flex items-center text-slate-800"><Crown className="w-5 h-5 mr-2 text-yellow-500" /> Top Performing Creators</h3>
                <ul className="mt-4 space-y-4">
                    {data.topCreators.map((c:any) => (
                        <li key={c.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <img src={c.profileImageUrl || `https://placehold.co/100x100/E2E8F0/475569?text=${c.username.charAt(0).toUpperCase()}`} alt={c.username} className="w-10 h-10 rounded-full" />
                                <p className="font-semibold text-slate-700">{c.username}</p>
                            </div>
                            <p className="text-slate-500 font-medium">{c.collectionsCount} collections</p>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-bold text-lg flex items-center text-slate-800"><Package className="w-5 h-5 mr-2 text-blue-500" /> Top Performing Products</h3>
                 <ul className="mt-4 space-y-4">
                    {data.topProducts.map((p:any) => (
                        <li key={p.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-md object-cover" />
                                <p className="font-semibold text-slate-700 truncate">{p.name}</p>
                            </div>
                            <p className="text-slate-500 font-medium">{p.features} features</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
);


const CampaignsTab = ({ brandId }: { brandId: string }) => {
    const { data: campaigns, isLoading } = useQuery({
        queryKey: ['brandCampaigns', brandId],
        queryFn: () => getBrandCampaigns(brandId)
    });
    if (isLoading) return <div className="text-center p-12">Loading campaigns...</div>;
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800">Your Campaigns</h3>
                <button className="bg-teal-500 text-white font-semibold px-4 py-2 rounded-lg flex items-center shadow hover:bg-teal-600"><Plus className="w-5 h-5 mr-2" />Create Campaign</button>
            </div>
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b bg-slate-50">
                        <th className="p-3 text-sm font-semibold text-slate-600">Name</th>
                        <th className="p-3 text-sm font-semibold text-slate-600">Status</th>
                        <th className="p-3 text-sm font-semibold text-slate-600">Products</th>
                        <th className="p-3 text-sm font-semibold text-slate-600">Clicks</th>
                    </tr>
                </thead>
                <tbody>
                    {campaigns.map((c: any) => (
                        <tr key={c.id} className="border-b last:border-b-0 hover:bg-slate-50">
                            <td className="p-3 font-medium text-slate-800">{c.name}</td>
                            <td className="p-3">{c.isActive ? <div className="flex items-center space-x-2"><CheckCircle className="text-green-500 w-5 h-5"/> <span className="text-green-700">Active</span></div> : <div className="flex items-center space-x-2"><XCircle className="text-slate-400 w-5 h-5"/> <span className="text-slate-500">Inactive</span></div>}</td>
                            <td className="p-3 text-slate-600">{c._count.products}</td>
                            <td className="p-3 text-slate-600">0</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
const ProductsTab = ({ brandId }: { brandId: string }) => {
    const { data: products, isLoading } = useQuery({
        queryKey: ['brandProducts', brandId],
        queryFn: () => getBrandProducts(brandId)
    });
    if (isLoading) return <div className="text-center p-12">Loading products...</div>;
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 mb-4">Product Performance</h3>
            <table className="w-full text-left">
                 <thead>
                    <tr className="border-b bg-slate-50">
                        <th className="p-3 text-sm font-semibold text-slate-600">Product</th>
                        <th className="p-3 text-sm font-semibold text-slate-600">Features</th>
                        <th className="p-3 text-sm font-semibold text-slate-600">Clicks</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p: any) => (
                         <tr key={p.id} className="border-b last:border-b-0 hover:bg-slate-50">
                            <td className="p-3 font-medium text-slate-800 flex items-center space-x-3">
                                <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-md object-cover" />
                                <span>{p.name}</span>
                            </td>
                            <td className="p-3 text-slate-600">{p.features}</td>
                            <td className="p-3 text-slate-600">{p.clicks}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
const CreatorsTab = ({ brandId }: { brandId: string }) => {
    const { data: creators, isLoading } = useQuery({
        queryKey: ['brandCreators', brandId],
        queryFn: () => getBrandCreators(brandId)
    });
    if (isLoading) return <div className="text-center p-12">Loading creators...</div>;
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 mb-4">Creators Featuring Your Products</h3>
            <ul className="space-y-2">
                {creators.map((c: any) => (
                    <li key={c.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                            <img src={c.profileImageUrl || `https://placehold.co/100x100/E2E8F0/475569?text=${c.username.charAt(0).toUpperCase()}`} alt={c.username} className="w-12 h-12 rounded-full" />
                            <div>
                                <p className="font-semibold text-slate-800">{c.username}</p>
                                <p className="text-sm text-slate-500">{c.followers.toLocaleString()} followers</p>
                            </div>
                        </div>
                        <p className="text-slate-600 font-medium">{c.collectionsCount} collections</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};
// --- MAIN DASHBOARD PAGE ---
export default function BrandDashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('Overview');
    const brandId = user?.brand?.id || null; 
    //const brandId = "clv99juqk000108l4dn3r772r";
    // This is a placeholder. In a real app, the brandId would come from the user object.
   // const MOCK_BRAND_ID = "YOUR_BRAND_ID"; 

    useEffect(() => {
        if (!loading && (!user || user.role !== 'BRAND')) {
            router.push('/brand/login');
        }
    }, [user, loading, router]);

    const { data: overview, isLoading: isLoadingOverview } = useQuery({
        queryKey: ['brandOverview', brandId],
        queryFn: () => getBrandOverview(brandId!),
        enabled: !!user && user.role === 'BRAND' && !!brandId,
    });

    if (loading || !user) {
        return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div></div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white p-4 border-b">
                <div className="container mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900">Brand Dashboard</h1>
                    {/* Profile Dropdown could be added here */}
                </div>
            </header>
            <main className="container mx-auto p-4 sm:p-8">
                <div className="flex space-x-2 border-b mb-6">
                    <TabButton label="Overview" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="Campaigns" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="Products" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="Creators" activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>

                {isLoadingOverview ? <div className="text-center p-12">Loading dashboard...</div> : (
                    <>
                        {activeTab === 'Overview' && <OverviewTab data={overview} />}
                        {activeTab === 'Campaigns' && <CampaignsTab brandId={brandId} />}
                        {activeTab === 'Products' && <ProductsTab brandId={brandId} />}
                        {activeTab === 'Creators' && <CreatorsTab brandId={brandId} />}
                    </>
                )}
            </main>
        </div>
    );
}