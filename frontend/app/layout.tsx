'use client'; // <-- Add this to make the entire file a Client Component

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/providers";
import { AuthProvider } from "@/lib/auth-context";
import { AuthModal } from "@/components/shared/AuthModal";
import Header from "@/components/shared/Header";
import AppNavigation from "@/components/shared/AppNavigation";
import Footer from "@/components/shared/Footer";
import { usePathname } from "next/navigation"; // This hook can now be used

const inter = Inter({ subsets: ["latin"] });

// Note: Metadata export is not used in a Client Component root layout,
// but can be handled in child page.tsx files.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname(); // Get the current URL path

  // This is the logic to hide the footer on the create collection page
  const showFooter = pathname !== '/collections/new';

  return (
    <html lang="en">
      <body className={`${inter.className} bg-white`}>
        <Providers>
          <AuthProvider>
            <div className="flex flex-col h-screen">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <AppNavigation />
                <main className="flex-1 overflow-y-auto bg-slate-50 pb-16 sm:pb-0">
                  {children}
                </main>
              </div>
            </div>
            <AuthModal />
            
            {/* THIS IS THE UPDATED FOOTER LOGIC */}
            {showFooter && (
              <div className="hidden md:block">
                <Footer />
              </div>
            )}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}