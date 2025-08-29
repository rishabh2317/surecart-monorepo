// app/(marketing)/for-brands/page.tsx
'use client';

import Link from 'next/link';
import { BarChart2, Users, Zap, CheckCircle } from 'lucide-react';

// --- Sub-Components for a clean structure ---
const FeatureCard = ({ icon: Icon, title, description }: any) => (
    <div className="text-left p-8 bg-white rounded-2xl shadow-lg border border-slate-200">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 mb-5">
            <Icon className="w-6 h-6 text-teal-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-slate-600 leading-relaxed">{description}</p>
    </div>
);

const StatCard = ({ value, label }: { value: string, label: string }) => (
    <div className="bg-teal-50 p-6 rounded-xl text-center">
        <p className="text-4xl font-extrabold text-teal-600">{value}</p>
        <p className="mt-1 text-sm font-medium text-slate-200">{label}</p>
    </div>
);

// --- MAIN PAGE ---
export default function ForBrandsPage() {
  return (
    <div className="bg-slate-50">
      <main>
        {/* --- Hero Section --- */}
        <section className="text-center py-20">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight">
              Authentic Reach. Measurable Results.
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-700">
              Stop guessing your ROI. Stash is a performance-based platform that connects your products with thousands of trusted creators who drive real sales.
            </p>
            <div className="mt-10">
                <Link href="/brand-register" className="text-xl inline-flex items-center justify-center px-10 py-5 font-semibold text-white bg-teal-500 rounded-lg shadow-md hover:bg-teal-600">
                    Get Started
                </Link>
            </div>
          </div>
        </section>

        {/* --- "How It Works" Section --- */}
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-800">Your High-Performance Marketing Channel</h2>
                    <p className="mt-2 text-lg text-slate-600">A simple, three-step process to scale your brand.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <FeatureCard 
                        icon={Zap}
                        title="1. Activate at Scale"
                        description="Upload your product catalog. Our network of thousands of creators—from nano to macro—can instantly discover and feature your products in their authentic, curated collections."
                    />
                    <FeatureCard 
                        icon={Users}
                        title="2. Drive Authentic Sales"
                        description="Creators share their collections with their engaged audiences. Consumers, trusting the recommendation, click to buy directly from your site, powered by our seamless tracking."
                    />
                    <FeatureCard 
                        icon={BarChart2}
                        title="3. Measure Everything"
                        description="Our world-class dashboard gives you a clear view of your ROI. Track clicks, conversions, and sales driven by each creator, and see exactly which products are trending."
                    />
                </div>
            </div>
        </section>

        {/* --- Data/Social Proof Section --- */}
        <section className="py-20">
            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="pr-8">
                    <p className="font-semibold text-teal-600">BUILT FOR GROWTH</p>
                    <h2 className="text-4xl font-extrabold text-slate-900 mt-2">Why Stash Works</h2>
                    <p className="mt-4 text-lg text-slate-700">Traditional advertising is expensive and ineffective. We connect you with the long-tail of influence, where authenticity drives higher conversion rates and a better ROI.</p>
                    <ul className="mt-6 space-y-6">
                        <li className="flex items-start">
                            <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <span className="font-semibold text-slate-800">Performance-Based:</span>
                                <span className="text-slate-700 ml-1">You only pay for what works. Track every click and every sale to understand your true return on investment.</span>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <span className="font-semibold text-slate-800">Massive Scalability:</span>
                                <span className="text-slate-700 ml-1">Access thousands of creators who are ready to promote your products, without the manual outreach and negotiation.</span>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <span className="font-semibold text-slate-800">Brand Safety:</span>
                                <span className="text-slate-700 ml-1">Maintain control with a suite of brand safety tools, ensuring your products are always featured in the right context.</span>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <StatCard value="10x" label="Higher Engagement vs. Ads" />
                    <StatCard value="92%" label="Trust in Creator Recommendations" />
                    <StatCard value="30%" label="Higher Average Order Value" />
                    <StatCard value="+75%" label="Creator-Driven ROI" />
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}