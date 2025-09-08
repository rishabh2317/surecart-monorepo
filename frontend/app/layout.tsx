import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/providers";
import { AuthProvider } from "@/lib/auth-context";
import { AuthModal } from "@/components/shared/AuthModal";
import ClientLayout from "@/components/shared/ClientLayout"; // Import the new component

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
            {/* The new component now wraps your page content */}
            <ClientLayout>{children}</ClientLayout>
            
            <AuthModal />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}