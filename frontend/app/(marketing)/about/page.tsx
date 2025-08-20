// app/(marketing)/about/page.tsx
import Link from 'next/link';
import { Layers, Zap, Heart, Users } from 'lucide-react';

// --- Sub-Components for a clean structure ---
const ValueCard = ({ icon: Icon, title, description }: any) => (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-teal-100 mb-6 mx-auto">
            <Icon className="w-8 h-8 text-teal-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 text-center">{title}</h3>
        <p className="mt-2 text-slate-600 text-center leading-relaxed">{description}</p>
    </div>
);

// --- MAIN PAGE ---
export default function AboutPage() {
  return (
    <div className="bg-slate-50">
      <main>
        {/* --- Hero Section --- */}
        <section className="text-center py-24 bg-slate-50">
            <div className="container mx-auto px-4">
                <p className="font-semibold text-teal-600">Our Mission</p>
                <h1 className="mt-2 text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight">
                    To build a more authentic internet.
                </h1>
                <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-slate-700">
                    We believe the future of commerce is not about ads, it is about people. surecart was founded on a simple idea: that an authentic recommendation from a trusted voice is the most powerful marketing force in the world. Our mission is to build the tools that unleash that power for everyone.
                </p>
            </div>
        </section>

        {/* --- "How it Works" Visual Section --- */}
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-slate-800">How It Works</h2>
                    <p className="mt-3 text-lg text-slate-600">We connect three key groups to create a virtuous cycle of discovery and commerce.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <div className="flex items-center justify-center h-32 w-32 rounded-full bg-teal-100">
                                <Users className="w-12 h-12 text-teal-600" />
                            </div>
                        </div>
                        <h3 className="mt-6 text-2xl font-bold text-slate-800">Creators</h3>
                        <p className="mt-2 text-slate-600">Share their expertise and taste by curating collections of products they genuinely love and use.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="relative">
                           <div className="flex items-center justify-center h-32 w-32 rounded-full bg-teal-100">
                                <Layers className="w-12 h-12 text-teal-600" />
                            </div>
                        </div>
                        <h3 className="mt-6 text-2xl font-bold text-slate-800">Collections</h3>
                        <p className="mt-2 text-slate-600">Become beautiful, shoppable stories that provide context and build confidence for consumers.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <div className="flex items-center justify-center h-32 w-32 rounded-full bg-teal-100">
                                <Heart className="w-12 h-12 text-teal-600" />
                            </div>
                        </div>
                        <h3 className="mt-6 text-2xl font-bold text-slate-800">Consumers</h3>
                        <p className="mt-2 text-slate-600">Discover and shop with confidence, guided by the authentic recommendations of the creators they trust.</p>
                    </div>
                </div>
            </div>
        </section>
        
        {/* --- Our Values Section --- */}
        <section className="py-24 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-slate-800">Our Values</h2>
                    <p className="mt-3 text-lg text-slate-600">The principles that guide every decision we make.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <ValueCard 
                        icon={Zap}
                        title="Empower the Individual"
                        description="We build tools for the solo creator, the small brand, the independent voice. Our success is measured by the success of our users."
                    />
                    <ValueCard 
                        icon={Heart}
                        title="Authenticity Over Ads"
                        description="We believe that a genuine recommendation will always be more powerful than a disruptive advertisement. Our platform is designed to amplify authentic voices, not replace them."
                    />
                    <ValueCard 
                        icon={Users}
                        title="Community-First"
                        description="We are building a marketplace, but also a community. We foster connections between creators, their audiences, and the brands they love."
                    />
                </div>
            </div>
        </section>

        {/* --- Final Call to Action --- */}
        <section className="bg-white py-24">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold text-black">Join the new era of commerce.</h2>
                <div className="mt-8 flex justify-center gap-4">
                    <Link href="/login?action=signup" className="text-lg inline-flex items-center justify-center px-8 py-4 font-semibold text-slate-900 bg-white rounded-lg shadow-md hover:bg-slate-200">
                        Become a Creator
                    </Link>
                    <Link href="/for-brands" className="text-lg inline-flex items-center justify-center px-8 py-4 font-semibold text-white bg-teal-500 rounded-lg shadow-md hover:bg-teal-600">
                        Partner as a Brand
                    </Link>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}