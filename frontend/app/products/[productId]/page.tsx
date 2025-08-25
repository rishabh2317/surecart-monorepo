// app/products/[productId]/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, notFound } from 'next/navigation';
import { getProductDetails } from '@/lib/api';
import Link from 'next/link';
import { ExternalLink, Layers } from 'lucide-react';
import { useState } from 'react';

// --- Sub-Components ---
const CollectionCard = ({ collection }: { collection: any }) => (
    <div className="break-inside-avoid mb-4">
        <Link href={`/${collection.author}/${collection.slug}`} className="block group relative">
            <img src={collection.coverImage} alt={collection.name} className="w-full rounded-2xl shadow-lg" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                <div className="absolute bottom-0 left-0 p-4"><h3 className="font-semibold text-white text-sm">{collection.name}</h3></div>
            </div>
        </Link>
    </div>
);

// --- MAIN PAGE ---
export default function ProductDetailPage() {
    const params = useParams();
    const productId = params.productId as string;
    const [mainImage, setMainImage] = useState<string | null>(null);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['productDetails', productId],
        queryFn: () => getProductDetails(productId),
        enabled: !!productId,
    });

    if (isLoading) return <div className="text-center p-12">Loading Product...</div>;
    if (isError || !data) return notFound();

    const { product, collections } = data;
    const currentImage = mainImage || product.imageUrls[0];

    return (
        <div className="bg-white">
            <main className="container mx-auto p-4 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image Gallery */}
                    <div>
                        <div className="aspect-square w-full bg-slate-100 rounded-2xl overflow-hidden mb-4">
                            <img src={currentImage} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {product.imageUrls.map((img: string, index: number) => (
                                <button key={index} onClick={() => setMainImage(img)} className={`aspect-square bg-slate-100 rounded-lg overflow-hidden ring-2 ${currentImage === img ? 'ring-teal-500' : 'ring-transparent'}`}>
                                    <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Product Info */}
                    <div>
                        <p className="font-semibold text-teal-600">{product.brand?.name || 'Brand'}</p>
                        <h1 className="text-4xl font-extrabold text-slate-900 mt-2">{product.name}</h1>
                        <p className="mt-4 text-lg text-slate-700">{product.description}</p>
                        {/* Conditional CTA */}
                        {collections.length === 0 && (
                             <a href={product.baseUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center justify-center px-8 py-4 font-semibold text-white bg-slate-800 rounded-lg shadow-md hover:bg-slate-900">
                                Shop Now <ExternalLink className="w-5 h-5 ml-2" />
                            </a>
                        )}
                    </div>
                </div>

                {/* Featured In Collections Section */}
                {collections.length > 0 && (
                    <section className="mt-16 pt-12 border-t">
                        <div className="flex items-center space-x-3 mb-6">
                            <Layers className="w-7 h-7 text-teal-500" />
                            <h2 className="text-2xl font-bold text-slate-900">Featured in these Collections</h2>
                        </div>
                        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">
                            {collections.map((col: any) => <CollectionCard key={col.id} collection={col} />)}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}