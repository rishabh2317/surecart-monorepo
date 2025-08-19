// app/products/[productId]/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, CheckCircle, ExternalLink } from 'lucide-react';

// --- MOCK DATA for a single product ---
// In a real app, this would be fetched from your API using the productId from the URL
const productData = {
  id: 'prod1',
  name: 'The Ordinary Niacinamide 10% + Zinc 1%',
  brand: 'The Ordinary',
  images: [
    'https://placehold.co/600x600/E0E7FF/4F46E5?text=Serum+1',
    'https://placehold.co/600x600/E0E7FF/4F46E5?text=Texture',
    'https://placehold.co/600x600/E0E7FF/4F46E5?text=On+Skin',
  ],
  rating: 4.8,
  reviewsCount: 12543,
  description: "A high-strength vitamin and mineral blemish formula that visibly regulates sebum and minimizes pores. This water-based serum is great for those looking for solutions for signs of congestion, and visible shine.",
  retailers: [
    { id: 'ret1', name: 'Amazon', logo: 'https://placehold.co/100x40/FF9900/FFFFFF?text=Amazon', price: 6.50, currency: 'USD', link: '#' },
    { id: 'ret2', name: 'Flipkart', logo: 'https://placehold.co/100x40/2874F0/FFFFFF?text=Flipkart', price: 599.00, currency: 'INR', link: '#' },
    { id: 'ret3', name: 'The Ordinary Official', logo: 'https://placehold.co/100x40/333333/FFFFFF?text=Brand', price: 6.20, currency: 'USD', link: '#' },
  ]
};
// --- END MOCK DATA ---

export default function ProductDetailPage() {
  const [mainImage, setMainImage] = useState(productData.images[0]);

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-10 border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center space-x-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
            <h1 className="text-lg font-semibold text-slate-800 truncate px-4">{productData.brand}</h1>
            <div className="w-20"></div> {/* Spacer */}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <div className="aspect-square w-full bg-slate-100 rounded-2xl overflow-hidden mb-4">
              <img src={mainImage} alt={productData.name} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {productData.images.map((img, index) => (
                <button key={index} onClick={() => setMainImage(img)} className={`aspect-square bg-slate-100 rounded-lg overflow-hidden ring-2 ${mainImage === img ? 'ring-indigo-500' : 'ring-transparent'}`}>
                  <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info & Retailers */}
          <div>
            <h2 className="text-3xl font-bold text-slate-900">{productData.name}</h2>
            <div className="flex items-center mt-4 space-x-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.round(productData.rating) ? 'text-yellow-400' : 'text-slate-300'}`} fill="currentColor" />
                ))}
              </div>
              <span className="text-slate-600">{productData.rating} stars</span>
              <span className="text-indigo-600 font-medium">{productData.reviewsCount.toLocaleString()} reviews</span>
            </div>

            <p className="mt-6 text-slate-700 leading-relaxed">{productData.description}</p>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Shop From</h3>
              <div className="space-y-3">
                {productData.retailers.map(retailer => (
                  <a href={retailer.link} key={retailer.id} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-slate-50 p-4 rounded-xl hover:shadow-md hover:bg-white transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <img src={retailer.logo} alt={retailer.name} className="h-8 object-contain" />
                      <span className="font-semibold text-slate-700">{retailer.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xl font-bold text-slate-800">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: retailer.currency }).format(retailer.price)}
                      </span>
                      <div className="bg-indigo-600 text-white p-2 rounded-lg">
                        <ExternalLink className="w-5 h-5" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}