// app/(creator)/collections/new/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createCollection, searchProducts } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { getUserSession } from '@/lib/auth';
import CreatorPageHeader from '@/components/creator/CreatorPageHeader';
import {Check, Copy, X, UploadCloud, Edit, Search } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

// --- Types (from your original code) ---
interface Product { id: string; name: string; brand: string; imageUrl: string; }
interface User { id: string; username: string; email: string; }
interface Brand { id: string; name: string; }

// --- API Functions (from your original code) ---
const getBrands = async (): Promise<Brand[]> => {
    const res = await fetch(`http://localhost:3001/brands`);
    if (!res.ok) throw new Error("Failed to fetch brands");
    return res.json();
};

// --- Main Component ---
export default function NewCollectionPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  
  const [collectionName, setCollectionName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [shareableLink, setShareableLink] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  useEffect(() => {
    const sessionUser = getUserSession();
    if (!sessionUser) router.push('/login');
    else setUser(sessionUser);
  }, [router]);

  const { data: brands = [] } = useQuery({ queryKey: ['brands'], queryFn: getBrands });
  const { data: availableProducts = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', searchTerm, selectedBrand],
    queryFn: () => searchProducts(searchTerm, selectedBrand),
  });


    const createCollectionMutation = useMutation({
      mutationFn: createCollection,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id] });
        const slug = data.slug;
        const username = user?.username || 'creator';
        setShareableLink(`http://localhost:3000/${username}/${slug}`);
        setShowModal(true);
      },
      onError: (error: any) => { 
          alert(`Could not publish collection: ${error.message}`);
      }
    });

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
  // This hook creates a new list that is always sorted with selected items first
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
          <button onClick={closeModal} className="mt-6 w-full px-4 py-2 bg-slate-100 rounded-lg">Done</button>
        </div>
      </div>
    );
  }

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
        <aside className="w-full md:w-1/2 bg-white border-r border-slate-200 p-4 md:overflow-y-auto">
        <div className="md:sticky top-0 bg-white pt-2 pb-4 z-10">
            <h3 className="font-bold mb-4 text-slate-800">Add Products ({selectedProducts.length})</h3>
            <div className="relative mb-4">
                <input type="search" placeholder="Search products..." className="w-full pl-10 pr-4 py-2 border rounded-lg" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <Search className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-2">
                <button onClick={() => setSelectedBrand(null)} className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${!selectedBrand ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-700'}`}>All Brands</button>
                {brands.map(brand => (
                    <button key={brand.id} onClick={() => setSelectedBrand(brand.id)} className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${selectedBrand === brand.id ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-700'}`}>{brand.name}</button>
                ))}
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {isLoadingProducts ? <p>Loading...</p> : sortedAvailableProducts.map((product: Product) => {
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
        </aside>
      </div>
    </div>
  );
}