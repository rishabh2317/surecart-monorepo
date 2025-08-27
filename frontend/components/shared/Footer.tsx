// components/shared/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-100 border-t border-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 sm:py-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <p className="text-slate-600">&copy; 2025 Stash. All rights reserved.</p>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 mt-4 sm:mt-0">
          <Link href="/about" className="text-slate-600 hover:text-indigo-600">About</Link>
          <Link href="/for-creators" className="text-slate-600 hover:text-indigo-600">For Creators</Link>
          <Link href="/for-brands" className="text-slate-600 hover:text-teal-600">For Brands</Link>
          <Link href="/terms" className="text-slate-600 hover:text-indigo-600">Terms</Link>
          <Link href="/privacy" className="text-slate-600 hover:text-indigo-600">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}