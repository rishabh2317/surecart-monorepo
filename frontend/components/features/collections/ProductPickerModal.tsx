// components/features/collections/ProductPickerModal.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { searchProducts } from '@/lib/api';
import { X, Search } from 'lucide-react';
import { useState } from 'react';

interface Product { id: string; name: string; brand: string; imageUrl: string; }

interface ProductPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedProducts: Product[];
    onToggleProduct: (product: Product) => void;
}

export default function ProductPickerModal({ isOpen, onClose, selectedProducts, onToggleProduct }: ProductPickerModalProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['products', searchTerm],
        queryFn: () => searchProducts(searchTerm, null, null, null),
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
                <header className="p-4 border-b flex items-center justify-between flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-800">Add Products to Collection</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><X /></button>
                </header>
                
                <div className="p-4 flex-shrink-0">
                    <div className="relative">
                        <input
                            type="search"
                            placeholder="Search products from Amazon, brands..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                    </div>
                </div>

                <div className="overflow-y-auto p-4">
                    {isLoading ? <p>Loading...</p> : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {products.map((product: Product) => {
                                const isSelected = selectedProducts.some(p => p.id === product.id);
                                return (
                                    <div 
                                        key={product.id} 
                                        onClick={() => onToggleProduct(product)}
                                        className={`p-2 border rounded-lg cursor-pointer ${isSelected ? 'border-teal-500 ring-2 ring-teal-500' : 'border-slate-200'}`}
                                    >
                                        <div className="aspect-square bg-slate-100 rounded-md overflow-hidden mb-2">
                                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                        </div>
                                        <p className="font-semibold text-sm text-slate-700 truncate">{product.name}</p>
                                        <p className="text-xs text-slate-500">{product.brand}</p>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <footer className="p-4 border-t flex-shrink-0 text-right">
                    <button onClick={onClose} className="bg-teal-600 text-white font-semibold px-6 py-2 rounded-lg">Done</button>
                </footer>
            </div>
        </div>
    );
}