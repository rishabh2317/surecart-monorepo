// app/(app)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDashboardData, deleteCollection } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/config';
import {
  Plus, BarChart2, Share2, Edit, Trash2, Check, ExternalLink,
  MousePointerClick, Users, Star
} from 'lucide-react';

// --- Helpers ---
const getBrandDashboardData = async (brandId: string) => {
  const res = await fetch(`${API_BASE_URL}/brands/${brandId}/dashboard`);
  if (!res.ok) throw new Error("Failed to fetch brand data");
  return res.json();
};

const StatCard = ({ title, value, icon: Icon }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <Icon className="w-5 h-5 text-slate-400" />
    </div>
    <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
  </div>
);

// --- BRAND DASHBOARD ---
const BrandDashboard = ({ user }: { user: any }) => {
  const router = useRouter();
  const MOCK_BRAND_ID = user.brand?.id || "YOUR_BRAND_ID";

  useEffect(() => {
    if (user && user.role !== 'BRAND') router.push('/');
  }, [user, router]);

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
        <StatCard title="Total Clicks Driven" value={summary?.totalClicks?.toLocaleString() || '0'} icon={MousePointerClick} />
        <StatCard title="Collections Featuring You" value={summary?.totalCollections?.toLocaleString() || '0'} icon={Users} />
        <StatCard title="Top Performing Creator" value={summary?.topCreator?.username || 'N/A'} icon={Star} />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Top Creators Featuring Your Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm font-semibold text-slate-500 border-b">
                <th className="p-3">Creator</th>
                <th className="p-3">Collection</th>
                <th className="p-3 text-right">Clicks Driven</th>
              </tr>
            </thead>
            <tbody>
              {topCreators?.map((creator: any) => (
                <tr key={creator.id} className="border-b last:border-b-0">
                  <td className="p-3 font-medium text-slate-800 flex items-center space-x-3">
                    <img src={creator.profileImageUrl} alt={creator.username} className="w-8 h-8 rounded-full" />
                    <span>{creator.username}</span>
                  </td>
                  <td className="p-3 text-slate-600">{creator.collectionName}</td>
                  <td className="p-3 text-right font-semibold text-teal-600">{creator.clicks.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// --- CREATOR DASHBOARD ---
const CreatorDashboard = ({ user }: { user: any }) => {
  const queryClient = useQueryClient();
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: () => getDashboardData(user.id),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id] });
    },
  });

  const handleDelete = (collectionId: string) => {
    if (window.confirm("Are you sure you want to delete this collection?")) {
      deleteMutation.mutate(collectionId);
    }
  };

  const handleShare = (collection: any) => {
    const link = `http://localhost:3000/${collection.username}/${collection.slug}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(collection.id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const collections = dashboardData?.collections || [];

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Collections</h1>
          <p className="text-slate-600 mt-1">Manage, share, and track your curated content.</p>
        </div>
        <div className="flex items-center space-x-2 self-end sm:self-center">
          <Link href="/analytics">
            <button className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg flex items-center shadow-sm hover:bg-slate-50">
              <BarChart2 className="w-5 h-5 mr-2" />Analytics
            </button>
          </Link>
          <Link href="/collections/new">
            <button className="bg-teal-500 text-white font-semibold px-4 py-2 rounded-lg flex items-center shadow hover:bg-teal-600">
              <Plus className="w-5 h-5 mr-2" />New Collection
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((col: any) => (
          <div key={col.id} className="bg-white p-5 rounded-xl shadow-md flex flex-col group transition-shadow hover:shadow-lg">
            <Link href={`/collections/${col.id}`}>
              <h3 className="font-semibold text-slate-800 text-lg mb-2 truncate hover:text-teal-600 transition-colors">{col.name}</h3>
            </Link>
            <p className="text-sm text-slate-500 mb-4 flex-grow">{col.productsCount} products</p>

            <div className="flex-grow grid grid-cols-3 gap-4 text-center border-t border-b py-4">
              <div><p className="font-bold text-xl text-slate-800">{col.likes.toLocaleString()}</p><p className="text-xs text-slate-500">Likes</p></div>
              <div><p className="font-bold text-xl text-slate-800">{col.shares.toLocaleString()}</p><p className="text-xs text-slate-500">Shares</p></div>
              <div><p className="font-bold text-xl text-slate-800">{col.clicks?.toLocaleString() || 'N/A'}</p><p className="text-xs text-slate-500">Clicks</p></div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Link href={`/${col.username}/${col.slug}`} target="_blank" className="text-sm font-semibold text-teal-600 hover:underline flex items-center">
                View Public Page <ExternalLink className="w-4 h-4 ml-1.5" />
              </Link>
              <div className="flex items-center">
                <button onClick={() => handleShare(col)} className="p-2 text-slate-500 hover:text-teal-600" title="Copy Share Link">
                  {copiedLink === col.id ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
                </button>
                <Link href={`/collections/${col.id}/edit`} className="p-2 text-slate-500 hover:text-teal-600" title="Edit Collection">
                  <Edit className="w-5 h-5" />
                </Link>
                <button onClick={() => handleDelete(col.id)} className="p-2 text-slate-500 hover:text-red-500" title="Delete Collection">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {collections.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-medium text-slate-900">No collections yet</h3>
          <p className="mt-1 text-sm text-slate-500">Click New Collection to get started.</p>
        </div>
      )}
    </>
  );
};

// --- UNIFIED PAGE ---
export default function UnifiedDashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Handle shopper redirect in useEffect instead of JSX
  useEffect(() => {
    if (user && user.role === 'SHOPPER') {
      router.push('/');
    }
  }, [user, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // If user is a shopper, don't render anything (they'll be redirected)
  if (user.role === 'SHOPPER') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto p-4 sm:p-8">
        {user.role === 'CREATOR' && <CreatorDashboard user={user} />}
        {user.role === 'BRAND' && <BrandDashboard user={user} />}
      </main>
    </div>
  );
}