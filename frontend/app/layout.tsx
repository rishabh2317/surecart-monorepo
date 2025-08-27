// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/providers";
import { AuthProvider } from "@/lib/auth-context";
import { AuthModal } from "@/components/shared/AuthModal";
import Header from "@/components/shared/Header";
import AppNavigation from "@/components/shared/AppNavigation"; // We will create this next
import Footer from "@/components/shared/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "stash",
  description: "The world-class creator commerce platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
            <Footer /> {/* <-- ADD THIS LINE */}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}