// frontend/app/(app)/collections/new/page.tsx
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react'; // Import Suspense
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createCollection, searchProducts, getCampaigns, getBrands, getCampaignCategories } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import { getUserSession } from '@/lib/auth';
import CreatorPageHeader from '@/components/creator/CreatorPageHeader';
import {Check, Copy, X, UploadCloud, Edit, Search, ArrowLeft } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { API_BASE_URL } from '@/lib/config';

// --- Types ---
interface Product { id: string; name: string; brand: string; imageUrl: string; }
interface User { id: string; username: string; email: string; }
interface Brand { id: string; name: string; }
interface Campaign { id: string; name: string; description: string; coverImageUrl: string; brand: { name: string } }
interface Category { id: string; name: string; }

// --- Sub-Components ---
const CampaignCard = ({ campaign, onClick }: { campaign: Campaign, onClick: () => void }) => (
    <div onClick={onClick} className="cursor-pointer group">
        <div className="aspect-video w-full bg-slate-200 rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
            <img src={campaign.coverImageUrl} alt={campaign.name} className="w-full h-full object-cover" />
        </div>
        <h4 className="font-semibold text-slate-800 mt-2">{campaign.name}</h4>
        <p className="text-sm text-slate-500">{campaign.brand.name}</p>
    </div>
);

// This is your original component, now renamed to allow for the Suspense wrapper
function NewCollectionPageComponent() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams(); // This hook now works correctly
  const [user, setUser] = useState<User | null>(null);
  
  const [collectionName, setCollectionName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [shareableLink, setShareableLink] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const [view, setView] = useState<'campaigns' | 'categories' | 'products'>('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  

  useEffect(() => {
    const sessionUser = getUserSession();
    if (!sessionUser) router.push('/login');
    else setUser(sessionUser);
  }, [router]);

  // This useEffect now correctly reads the URL parameters on page load
  useEffect(() => {
    const campaignId = searchParams.get('campaignId');
    const campaignName = searchParams.get('campaignName');

    if (campaignId && campaignName) {
        setView('products');
        setSelectedCampaign({
            id: campaignId,
            name: campaignName,
            description: '', coverImageUrl: '', brand: { name: '' }
        });
    }
    else {
      // This part handles the direct journey from the "New Collection" button
      setView('categories');
  }
  }, [searchParams]);

  const { data: brands = [] } = useQuery<Brand[]>({ queryKey: ['brands'], queryFn: getBrands });
  const { data: campaigns = [], isLoading: isLoadingCampaigns } = useQuery<Campaign[]>({ 
      queryKey: ['campaigns'], 
      queryFn: getCampaigns 
  });
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['categories', selectedCampaign?.id],
    queryFn: () => getCampaignCategories(selectedCampaign!.id),
    enabled: !!selectedCampaign,
});

  const { data: availableProducts = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', searchTerm, selectedBrand, selectedCampaign?.id, selectedCategory?.id],
    queryFn: () => searchProducts(searchTerm, selectedBrand, selectedCampaign?.id || null, selectedCategory?.id || null),
    enabled: view === 'products' || searchTerm.length > 0, 
  });

  const createCollectionMutation = useMutation({
    mutationFn: createCollection,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id] });
      const slug = data.slug;
      const username = user?.username || 'creator';
      setShareableLink(`${window.location.origin}/${username}/${slug}`);
      setShowModal(true);
    },
    onError: (error: any) => { 
        alert(`Could not publish collection: ${error.message}`);
    }
  });
  
  // (Your handleCoverImageUpload, handleSave, toggleProductSelection, etc. functions remain here unchanged)
  // ...
// --- Event Handlers ---


const handleCampaignClick = (campaign: Campaign) => {
  setSelectedCampaign(campaign);
  setView('products');
};
const handleCategoryClick = (category: Category) => {
  setSelectedCategory(category);
  setView('products');
};

const handleBack = () => {
  if (view === 'products') {
      setView('categories');
      setSelectedCategory(null);
      setSearchTerm('');
  } else if (view === 'categories') {
      setView('campaigns');
      setSelectedCampaign(null);
  }
};
// When a search is performed, always switch to the products view
useEffect(() => {
if (searchTerm) {
    setView('products');
    setSelectedCategory(null);
    setSelectedCampaign(null); // Clear campaign selection when searching
}
}, [searchTerm]);




const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      alert("File is too large. Please select an image under 10MB.");
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    const IMGBB_API_KEY = '5dc139f5ddfcb2f57f4f2e87b9d40dce';
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST', body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setCoverImage(data.data.url);
      } else {
        throw new Error(data.error?.message || 'Image upload failed');
      }
    } catch (error: any) {
      alert(`Could not upload image: ${error.message || 'An unknown error occurred'}. Please ensure your ImgBB API key is correct.`);
    } finally {
      setIsUploading(false);
    }
  }
};


const handleSave = () => {
  if (!user) return alert("You must be logged in.");
  if (!collectionName) return alert("Please add a title for your collection.");
  createCollectionMutation.mutate({
    name: collectionName, products: selectedProducts, userId: user.id,
    description: description, coverImageUrl: coverImage,
  });
};


const toggleProductSelection = (product: Product) => {
  setSelectedProducts(prev =>
    prev.some(p => p.id === product.id)
      ? prev.filter(p => p.id !== product.id)
      : [...prev, product]
  );
};
 const handleCopy = () => {
  navigator.clipboard.writeText(shareableLink);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};


const closeModal = () => {
  setShowModal(false);
  router.push('/dashboard');
};
const sortedAvailableProducts = useMemo(() => {
  if (!availableProducts) return [];
 
  return [...availableProducts].sort((a, b) => {
    const aIsSelected = selectedProducts.some(p => p.id === a.id);
    const bIsSelected = selectedProducts.some(p => p.id === b.id);
    if (aIsSelected && !bIsSelected) return -1; // a comes first
    if (!aIsSelected && bIsSelected) return 1;  // b comes first
    return 0; // maintain original order
  });
}, [availableProducts, selectedProducts]);
 if (showModal) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center relative">
        <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X /></button>
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4"><Check className="h-8 w-8 text-green-600" /></div>
        <h3 className="text-2xl font-bold text-slate-800">Published!</h3>
        <p className="mt-2 text-slate-600">Your collection is live. Share this link with your audience.</p>
        <div className="mt-6 flex rounded-lg shadow-sm">
          <input type="text" readOnly className="flex-1 block w-full px-3 py-2 rounded-none rounded-l-lg bg-slate-100" value={shareableLink} />
          <button onClick={handleCopy} className={`inline-flex items-center px-4 py-2 border rounded-r-lg ${copied ? 'bg-green-600' : 'bg-teal-500'}`}><Copy className="w-5 h-5 text-white"/></button>
        </div>
        <button onClick={closeModal} className="bg-teal-500 mt-6 w-full px-4 py-2 bg-slate-100 rounded-lg">Done</button>
      </div>
    </div>
  );
}

  // The rest of your component's JSX and logic also remain here
  return (
    <div className="flex flex-col h-screen bg-slate-50">
       <CreatorPageHeader
    title="Create Collection"
    mainAction={
        <button onClick={handleSave} disabled={createCollectionMutation.isPending} className="bg-teal-500 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-teal-600 disabled:bg-teal-300">
            {createCollectionMutation.isPending ? 'Publishing...' : 'Publish'}
        </button>
    }
 />
 <div className="flex-grow flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
        {/* --- LEFT COLUMN: COLLECTION DETAILS (Redesigned) --- */}
        <main className="w-full md:w-1/2 p-6 md:overflow-y-auto">
          <div className="max-w-xl mx-auto">
           
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-700">Title</label>
                <input type="text" value={collectionName} onChange={e => setCollectionName(e.target.value)} placeholder="e.g. My Everyday Skincare" className="mt-1 w-full p-3 placeholder-slate-400 border border-slate-300 bg-white rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell your audience about this collection..." className="mt-1 w-full p-3 border placeholder-slate-400 border-slate-300 bg-white rounded-lg h-32"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cover Photo (Optional)</label>
                <div className="mt-1 relative max-w-md">
                    <div className="aspect-[4/3] w-full flex justify-center items-center border-2 border-slate-300 border-dashed rounded-xl bg-slate-100 bg-cover bg-center" style={{ backgroundImage: `url(${coverImage})` }}>
                        {!coverImage && !isUploading && (<div className="text-center p-4"><UploadCloud className="mx-auto h-10 w-10 text-slate-400" /><div className="flex text-sm text-slate-600 mt-2"><label htmlFor="cover-upload" className="relative cursor-pointer rounded-md font-medium text-teal-600 hover:text-teal-500"><span>Upload a file</span><input id="cover-upload" type="file" className="sr-only" onChange={handleCoverImageUpload} /></label></div></div>)}
                        {isUploading && (<div className="text-center p-4"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500 mx-auto"></div></div>)}
                    </div>
                    {coverImage && !isUploading && (<label htmlFor="cover-upload" className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-slate-100"><Edit className="w-5 h-5 text-slate-600" /><input id="cover-upload" type="file" className="sr-only" onChange={handleCoverImageUpload} /></label>)}
                </div>
              </div>
            </div>
          </div>
        </main>
 
 
        {/* --- RIGHT COLUMN: PRODUCT SELECTION (Redesigned) --- */}
        <aside className="w-full md:w-1/2 bg-white border-l border-slate-200 p-4 flex flex-col md:overflow-y-auto">
        <div className="sticky top-0 bg-white pt-2 pb-4 z-10">
                <div className="flex items-center mb-4">
                {view === 'products' && (
                <button onClick={handleBack} className="mr-3 p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </button>
            )}
                    <h3 className="font-bold text-slate-800 text-lg truncate">
                    {view === 'categories' ? 'Select a Category' : selectedCategory?.name || 'Search Results'}
                    <span className="font-normal text-slate-500"> ({selectedProducts.length} selected)</span>
                    </h3>
                </div>
                <div className="relative">
                    <input type="search" placeholder="Or search all products..." className="w-full pl-10 pr-4 py-2 border rounded-lg" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    <Search className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                </div>
            </div>
 
 
                    <div className="flex-grow overflow-y-auto">
                {view === 'categories' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                        {isLoadingCategories ? <p>Loading categories...</p> : categories.map((cat) => (
                            <button key={cat.id} onClick={() => handleCategoryClick(cat)} className="p-4 bg-slate-100 rounded-lg text-slate-700 font-semibold hover:bg-teal-100 hover:text-teal-700 text-center">
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}
                 {view === 'products' && (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {isLoadingProducts ? <p>Loading products...</p> : sortedAvailableProducts.map((product: Product) => {
                            const isSelected = selectedProducts.some(p => p.id === product.id);
                            return (
                                <div key={product.id} onClick={() => toggleProductSelection(product)} className={`p-2 border rounded-lg cursor-pointer relative ${isSelected ? 'border-teal-500 ring-2 ring-teal-500' : 'border-slate-200'}`}>
                                    {isSelected && <div className="absolute top-1 right-1 bg-teal-500 text-white rounded-full p-0.5"><Check className="w-3 h-3" /></div>}
                                    <div className="aspect-square bg-slate-100 rounded-md overflow-hidden mb-2"><img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /></div>
                                    <p className="font-semibold text-sm text-slate-800 truncate">{product.name}</p>
                                    <p className="text-xs text-slate-500">{product.brand}</p>
                                </div>
                            );
                        })}
                        </div>
                )}
            </div>
        </aside>
      </div>
    </div>
  );
 
}

// This is the new default export that wraps the page component in Suspense
export default function NewCollectionPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <NewCollectionPageComponent />
        </Suspense>
    );
    }