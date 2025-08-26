// app/(creator)/collections/[collectionId]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCollection, searchProducts, updateCollection } from '@/lib/api'; // We will add updateCollection here
import Link from 'next/link';
import { ArrowLeft, Save, X, CheckCircle } from 'lucide-react';


interface Product { id: string; name: string; brand: string; imageUrl: string; }

export default function EditCollectionPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const collectionId = params.collectionId as string;

  const [collectionName, setCollectionName] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  // 1. Fetch the specific collection data
  const { data: collectionData, isLoading, isError } = useQuery({
    queryKey: ['collection', collectionId],
    queryFn: () => getCollection(collectionId),
    enabled: !!collectionId,
  });

  // 2. Fetch the list of all available products
  const { data: productList = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => searchProducts('', null),
  });

  // 3. Populate state once the collection data is loaded
  useEffect(() => {
    if (collectionData) {
      setCollectionName(collectionData.name);
      setSelectedProducts(collectionData.products);
    }
  }, [collectionData]);

  // 4. Set up the mutation to save changes
  const updateMutation = useMutation({
    mutationFn: updateCollection, // This now calls the real API function
    onSuccess: () => {
      // Refetch the data for this collection and the dashboard for consistency
      queryClient.invalidateQueries({ queryKey: ['collection', collectionId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.push(`/collections/${collectionId}`);
    },
    onError: (error) => {
      alert(`Failed to update: ${error.message}`);
    }
  });

  const handleSave = () => {
    updateMutation.mutate({
      id: collectionId,
      name: collectionName,
      products: selectedProducts,
    });
  };

  const toggleProductSelection = (product: Product) => {
    setSelectedProducts(prev => 
      prev.some(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    );
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading Editor...</div>;
  if (isError) return <div className="flex justify-center items-center h-screen">Error loading collection.</div>;

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="bg-white p-4 border-b">
        <div className="container mx-auto flex items-center justify-between">
            <Link href={`/collections/${collectionId}`} className="text-slate-600"><ArrowLeft/></Link>
            <input type="text" className="text-xl font-bold text-slate-900 bg-transparent text-center" value={collectionName} onChange={e => setCollectionName(e.target.value)} />
            <button onClick={handleSave} disabled={updateMutation.isPending} className="bg-teal-500 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-teal-600 disabled:bg-teal-300">
                {updateMutation.isPending ? 'Saving...' : 'Save'}
            </button>
        </div>
      </header>
      <div className="flex-grow flex-1 flex flex-col md:flex-row overflow-hidden">
      <aside className="w-full md:w-1/3 lg:w-1/4 bg-white border-r md:border-b-0 border-b overflow-y-auto p-4 h-1/2 md:h-full">
          <h3 className="font-bold mb-4 text-slate-800">Available Products</h3>
          <div className="space-y-2">
            {productList.map((product: Product) => {
              const isSelected = selectedProducts.some(p => p.id === product.id);
              return (
                <div key={product.id} onClick={() => toggleProductSelection(product)} className={`flex items-center justify-between space-x-3 p-2 rounded-lg transition-colors ${isSelected ? 'bg-green-50' : 'hover:bg-slate-100 cursor-pointer'}`}>
                  <div className="flex items-center space-x-3">
                    <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-md"/>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{product.name}</p>
                      <p className="text-xs text-slate-600">{product.brand}</p>
                    </div>
                  </div>
                  {isSelected && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </aside>
        <main className="w-full md:w-2/3 lg:w-3/4 p-6 overflow-y-auto h-1/2 md:h-full">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Products in this Collection</h2>
          <div className="grid grid-cols-3 gap-4">
            {selectedProducts.map(product => (
                <div key={product.id} className="relative group">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-auto aspect-square rounded-lg"/>
                    <p className="text-sm font-semibold mt-1 text-slate-800">{product.name}</p>
                </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}