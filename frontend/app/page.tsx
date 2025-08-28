// app/page.tsx
'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/lib/config';
import { Eye } from 'lucide-react';


async function getHomepageFeed() {
   const res = await fetch(`${API_BASE_URL}/public/home`);
   if (!res.ok) return [];
   return res.json();
}


const CollectionCard = ({ collection }: { collection: any }) => (
    <div className="masonry-item mb-4 relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
      <Link href={`/${collection.author}/${collection.slug}`} className="block group">
        <img
          src={collection.coverImage}
          alt={collection.name}
          loading="lazy"
          className="w-full h-auto block"  // ✅ ensures natural height
        />
  
        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 p-4 w-full">
            <h3 className="font-bold text-white text-md leading-tight">
              {collection.name}
            </h3>
            <div className="flex items-center justify-between text-white mt-2">
              <div className="flex items-center space-x-2">
                <img
                  src={collection.authorAvatar}
                  alt={collection.author}
                  className="w-6 h-6 rounded-full border border-white"
                />
                <span className="text-xs font-medium">{collection.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span className="text-xs font-medium">
                  {collection.views.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
  


export default function HomePage() {
   const { data: collections = [], isLoading } = useQuery({ queryKey: ['homepageFeed'], queryFn: getHomepageFeed });


   return (
       <div className="container mx-auto p-4 sm:p-6 lg:p-8">
           {isLoading ? <div className="text-center">Loading feed...</div> : (
               <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">
                   {collections.map((col: any) => <CollectionCard key={col.id} collection={col} />)}
               </div>
           )}
       </div>
   );
}

