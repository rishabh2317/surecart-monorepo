// app/(creator)/collections/[collectionId]/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit, ExternalLink } from 'lucide-react';
import CreatorPageHeader from '@/components/creator/CreatorPageHeader';

const getCollection = async (collectionId: string) => {
    const res = await fetch(`http://localhost:3001/collections/${collectionId}`);
    if (!res.ok) throw new Error('Collection not found');
    return res.json();
};

export default function CreatorCollectionViewPage() {
    const params = useParams();
    const collectionId = params.collectionId as string;

    const { data: collection, isLoading, isError } = useQuery({
        queryKey: ['collection', collectionId],
        queryFn: () => getCollection(collectionId),
        enabled: !!collectionId,
    });

    if (isLoading) return <div className="text-center p-12">Loading Collection...</div>;
    if (isError) return notFound();

    return (
        <div className="min-h-screen bg-slate-50">
             <CreatorPageHeader 
                title={collection.name}
                mainAction={
                    <Link href={`/collections/${collection.id}/edit`}>
                        <button className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg flex items-center shadow-sm hover:bg-slate-50">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Collection
                        </button>
                    </Link>
                }
             />
            <main className="container mx-auto p-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {collection.products.map((product: any) => (
                        <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm group">
                            <div className="aspect-square w-full bg-slate-100 rounded-lg overflow-hidden mb-4">
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <h3 className="font-semibold text-slate-800 truncate">{product.name}</h3>
                            <p className="text-sm text-slate-500">{product.brand}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}