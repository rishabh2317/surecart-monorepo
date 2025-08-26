// app/products/[productId]/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, notFound } from 'next/navigation';
import { getProductDetails } from '@/lib/api';
import Link from 'next/link';
import { ExternalLink, Layers } from 'lucide-react';
import { useState } from 'react';

// --- Sub-Components for a World-Class Structure ---

const ProductGallery = ({ product, mainImage, setMainImage }: { product: any, mainImage: string, setMainImage: (url: string) => void }) => (
    <div className="sticky top-24"> {/* Makes the product info stick while scrolling collections */}
        <div className="aspect-square w-full bg-white rounded-2xl overflow-hidden shadow-lg border">
            <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
        </div>
        {product.imageUrls.length > 1 && (
            <div className="grid grid-cols-5 gap-2 mt-4">
                {product.imageUrls.map((img: string, index: number) => (
                    <button key={index} onClick={() => setMainImage(img)} className={`aspect-square bg-slate-100 rounded-lg overflow-hidden ring-2 transition ${mainImage === img ? 'ring-teal-500' : 'ring-transparent'}`}>
                        <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        )}
    </div>
);

const CollectionCard = ({ collection }: { collection: any }) => (
    <Link href={`/${collection.author}/${collection.slug}`} className="block group">
        <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition-shadow flex items-center space-x-4">
            <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                <img src={collection.coverImage} alt={collection.name} className="w-full h-full object-cover" />
            </div>
            <div>
                <h4 className="font-semibold text-slate-800 group-hover:text-teal-600">{collection.name}</h4>
                <p className="text-sm text-slate-500">by {collection.author}</p>
            </div>
        </div>
    </Link>
);


// --- MAIN PAGE ---
export default function ProductDetailPage() {
    const params = useParams();
    const productId = params.productId as string;

    const { data, isLoading, isError } = useQuery({
        queryKey: ['productDetails', productId],
        queryFn: () => getProductDetails(productId),
        enabled: !!productId,
    });
    
    // The main image state is now managed here
    const [mainImage, setMainImage] = useState<string | null>(null);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
            </div>
        );
    }
    if (isError || !data) return notFound();

    const { product, collections } = data;
    // Set the initial main image only once when data loads
    const currentImage = mainImage || product.imageUrls[0];

    return (
        <div className="bg-slate-50">
            <main className="container mx-auto p-4 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                    {/* --- LEFT COLUMN: Product Details (Secondary Focus) --- */}
                    <div className="lg:col-span-1">
                        <ProductGallery product={product} mainImage={currentImage} setMainImage={setMainImage} />
                    </div>

                    {/* --- RIGHT COLUMN: Curation & Action (Primary Focus) --- */}
                    <div className="lg:col-span-1">
                        <div className="py-4">
                            <p className="font-semibold text-teal-600">{product.brand?.name || 'Brand'}</p>
                            <h1 className="text-4xl font-extrabold text-slate-900 mt-2">{product.name}</h1>
                            <p className="mt-4 text-lg text-slate-700 leading-relaxed">{product.description}</p>
                        </div>
                        
                        {/* --- CONDITIONAL CTA & COLLECTION LIST --- */}
                        <div className="mt-8">
                            {collections.length > 0 ? (
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-3">
                                        <Layers className="w-7 h-7 text-teal-500" />
                                        <h2 className="text-2xl font-bold text-slate-900">Featured In ({collections.length})</h2>
                                    </div>
                                    <div className="space-y-4">
                                        {collections.map((col: any) => <CollectionCard key={col.id} collection={col} />)}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white p-8 rounded-2xl shadow-lg border text-center">
                                    <h2 className="text-2xl font-bold text-slate-800">Shop this Product</h2>
                                    <p className="mt-2 text-slate-600">This product is not yet featured in any collections. Be the first!</p>
                                     <a href={product.baseUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center justify-center px-8 py-4 font-semibold text-white bg-slate-800 rounded-lg shadow-md hover:bg-slate-900">
                                        Shop Now <ExternalLink className="w-5 h-5 ml-2" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}