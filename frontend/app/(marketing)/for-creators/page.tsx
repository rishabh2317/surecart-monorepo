// app/(marketing)/for-creators/page.tsx
import Link from 'next/link';
import { BarChart2, Edit, Zap, MousePointerClick, Share2, Wallet } from 'lucide-react';


// --- Feature Card Sub-Component ---
const FeatureCard = ({ icon: Icon, title, description }: any) => (
   <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
       <div className="flex items-center justify-center h-16 w-16 rounded-full bg-teal-100 mb-6 mx-auto">
           <Icon className="w-8 h-8 text-teal-600" />
       </div>
       <h3 className="text-xl font-bold text-slate-800">{title}</h3>
       <p className="mt-2 text-slate-600">{description}</p>
   </div>
);


// --- MAIN PAGE ---
export default function ForCreatorsPage() {
 return (
   <div className="bg-white">
     <main>
       {/* --- Hero Section --- */}
       <section className="text-center py-20">
         <div className="container mx-auto px-4">
           <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight">
             Your Influence, Your Income.
           </h1>
           <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-700">
             Stop just recommending products. Start earning from them. Stash gives you the tools to build beautiful, shoppable collections in minutes. No contracts, no negotiations. Just curate, share, and earn.
           </p>
           <div className="mt-10">
               <Link href="/login?action=signup" className="text-xl inline-flex items-center justify-center px-10 py-5 font-semibold text-white bg-teal-500 rounded-lg shadow-md hover:bg-teal-600">
               <Link href="/login?action=signup" className="text-xl ...">Create Your First Collection (It&apos;s Free)</Link>
               </Link>
           </div>
         </div>
       </section>
         {/* --- Three-Step "How it Works" Section --- */}
         <section className="py-20 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    {/* Step 1: Curate */}
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center h-48 w-48 rounded-2xl bg-teal-50 mb-6">
                            <MousePointerClick className="w-20 h-20 text-teal-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">1. Curate</h2>
                        <p className="mt-2 text-slate-600">
                            Easily discover and select products from a universal catalog of top brands and retailers to build your beautiful, shoppable collections.
                        </p>
                    </div>
                    {/* Step 2: Share */}
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center h-48 w-48 rounded-2xl bg-teal-50 mb-6">
                            <Share2 className="w-20 h-20 text-teal-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">2. Share</h2>
                        <p className="mt-2 text-slate-600">
                            Publish your collection to generate a unique, shareable link. Add it to your social media bio, a blog post, or anywhere your audience lives.
                        </p>
                    </div>
                    {/* Step 3: Earn */}
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center h-48 w-48 rounded-2xl bg-teal-50 mb-6">
                            <Wallet className="w-20 h-20 text-teal-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">3. Earn</h2>
                        <p className="mt-2 text-slate-600">
                            When your audience clicks your links and makes a purchase, you earn a commission. Track your performance with a world-class analytics dashboard.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <section className="text-center py-20 bg-white">
           <div className="container mx-auto px-4">
               <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight">
                   An idea, curated by you, <br /> can inspire the world.
               </h1>
               <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-700">
                   Stash is a visual discovery engine that connects creators, their taste, and their audience with the products they love.
               </p>
           </div>
       </section>


       {/* --- Benefits Section --- */}
       <section className="py-20 bg-slate-50">
           <div className="container mx-auto px-4">
               <div className="text-center mb-12">
                   <h2 className="text-3xl font-bold text-slate-800">Everything you need to succeed</h2>
                   <p className="mt-2 text-lg text-slate-600">A world-class toolset, built for creators.</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                   <FeatureCard
                       icon={Edit}
                       title="Intuitive Editor"
                       description="Build beautiful collections in minutes with our drag-and-drop editor and universal product catalog."
                   />
                   <FeatureCard
                       icon={Zap}
                       title="Instant Monetization"
                       description="Every collection is instantly monetized with a shareable smart link. No brand deals required."
                   />
                   <FeatureCard
                       icon={BarChart2}
                       title="Powerful Analytics"
                       description="Track your performance with a world-class dashboard. See your clicks, conversions, and earnings in one place."
                   />
               </div>
           </div>
       </section>
     </main>
   </div>
 );
}

