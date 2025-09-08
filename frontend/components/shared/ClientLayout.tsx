'use client';

import Header from '@/components/shared/Header';
import AppNavigation from '@/components/shared/AppNavigation';
import Footer from '@/components/shared/Footer';
import { usePathname } from 'next/navigation';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // This is the logic to hide the footer on the create collection page
  const showFooter = pathname !== '/collections/new';

  return (
    <>
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <AppNavigation />
          <main className="flex-1 overflow-y-auto bg-slate-50 pb-16 sm:pb-0">
            {children}
          </main>
        </div>
      </div>
      
      {/* This footer is now "smart" and will render correctly */}
      {showFooter && (
        <div className="hidden md:block">
            <Footer />
        </div>
      )}
    </>
  );
}