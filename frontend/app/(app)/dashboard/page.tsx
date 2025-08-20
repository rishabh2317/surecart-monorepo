// app/(app)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDashboardData, deleteCollection } from '@/lib/api';
import { getUserSession } from '@/lib/auth';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Plus, BarChart2, Share2, Trash2, Check, ExternalLink, Edit, MousePointerClick, Users, Star } from 'lucide-react';

// --- Define specific types to fix "any" errors ---
interface Collection {
  id: string;
  name: string;
  slug: string;
  productsCount: number;
  likes: number;
  shares: number;
  clicks?: number;
  username: string;
}

interface DashboardData {
  collections: Collection[];
}

interface User {
  id: string;
  username: string;
  role: string;
}

// --- API Functions (moved from inside the component) ---
const getBrandDashboardData = async (brandId: string) => {
    const res = await fetch(`http://localhost:3001/brands/${brandId}/dashboard`);
    if (!res.ok) throw new Error("Failed to fetch brand data");
    return res.json();
};

// --- BRAND DASHBOARD (Dumb Component) ---
const BrandDashboard = ({ user }: { user: User }) => {
    const MOCK_BRAND_ID = "dce247f1-f7b1-4275-af27-50f4c8fa3f4d"; // Placeholder
    
    const { data, isLoading } = useQuery({
        queryKey: ['brandDashboard', MOCK_BRAND_ID],
        queryFn: () => getBrandDashboardData(MOCK_BRAND_ID),
        enabled: !!user,
    });

    if (isLoading) return <div className="text-center p-12">Loading Brand Dashboard...</div>;
    const { summary, topCreators } = data || {};

    return (
        <>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Brand Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Stat Cards can be added here */}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Top Creators</h2>
                <p>Brand-specific analytics will be shown here.</p>
            </div>
        </>
    );
};

// --- CREATOR DASHBOARD (Dumb Component) ---
const CreatorDashboard = ({ collections, isLoading, onDelete, onShare, copiedLink }: {
    collections: Collection[];
    isLoading: boolean;
    onDelete: (id: string) => void;
    onShare: (col: Collection) => void;
    copiedLink: string | null;
}) => {
    if (isLoading) return <div className="text-center p-12">Loading Creator Dashboard...</div>;

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-slate-900">My Collections</h2>
                <div className="flex items-center space-x-2 self-end sm:self-center">
                    <Link href="/analytics"><button className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg flex items-center shadow-sm hover:bg-slate-50">View Analytics</button></Link>
                    <Link href="/collections/new"><button className="bg-teal-500 text-white font-semibold px-4 py-2 rounded-lg flex items-center shadow hover:bg-teal-600"><Plus className="w-5 h-5 mr-2" />New Collection</button></Link>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((col) => (
                <div key={col.id} className="bg-white p-5 rounded-xl shadow-md flex flex-col group transition-shadow hover:shadow-lg">
                    <Link href={`/collections/${col.id}`}><h3 className="font-semibold text-slate-800 text-lg mb-2 truncate hover:text-teal-600 transition-colors">{col.name}</h3></Link>
                    <p className="text-sm text-slate-500 mb-4 flex-grow">{col.productsCount} products</p>
                     <div className="flex-grow grid grid-cols-3 gap-4 text-center border-t border-b py-4">
                        <div><p className="font-bold text-xl text-slate-800">{col.likes.toLocaleString()}</p><p className="text-xs font-medium text-slate-500">Likes</p></div>
                        <div><p className="font-bold text-xl text-slate-800">{col.shares.toLocaleString()}</p><p className="text-xs font-medium text-slate-500">Shares</p></div>
                        <div><p className="font-bold text-xl text-slate-800">{col.clicks?.toLocaleString() || '0'}</p><p className="text-xs font-medium text-slate-500">Clicks</p></div>
                    </div>
                    <div className="pt-4 mt-4 border-t flex items-center justify-end">
                      <div className="flex items-center">
                          <button onClick={() => onShare(col)} className="p-2 text-slate-500 hover:text-teal-600" title="Copy Share Link">{copiedLink === col.id ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}</button>
                          <Link href={`/collections/${col.id}/edit`} className="p-2 text-slate-500 hover:text-teal-600" title="Edit Collection"><Edit className="w-5 h-5" /></Link>
                          <button onClick={() => onDelete(col.id)} className="p-2 text-slate-500 hover:text-red-500" title="Delete Collection"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                </div>
              ))}
            </div>
        </>
    );
};


// --- UNIFIED DASHBOARD PAGE (The Smart Parent) ---
export default function UnifiedDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const { data: dashboardData, isLoading: creatorDashboardLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard', user?.id],
    queryFn: () => user ? getDashboardData(user.id) : Promise.resolve(null),
    enabled: !!user && user.role === 'CREATOR',
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id] }); },
  });

  const handleDelete = (collectionId: string) => { if (window.confirm("Are you sure?")) deleteMutation.mutate(collectionId); };
  
  const handleShare = (collection: Collection) => {
    const link = `http://localhost:3000/${collection.username}/${collection.slug}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(collection.id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  if (authLoading || !user) {
    return (
        <div className="flex items-center justify-center h-[80vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
        </div>
    );
  }
  // This useEffect will safely redirect shoppers AFTER the component has rendered
  useEffect(() => {
    if (user && user.role === 'SHOPPER') {
        router.push('/likes');
    }
}, [user, router]);

// The main loading state
if (authLoading || !user) {
  return (
      <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
      </div>
  );
}

// The return statement is now cleaner
return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto p-4 sm:p-8">
        {user?.role === 'CREATOR' && (
          <CreatorDashboard 
            collections={dashboardData?.collections || []}
            isLoading={creatorDashboardLoading}
            onDelete={handleDelete}
            onShare={handleShare}
            copiedLink={copiedLink}
          />
        )}
        {user?.role === 'BRAND' && user && <BrandDashboard user={user!} />}
        {/* The broken line is now gone from here */}
      </main>
    </div>
);
}