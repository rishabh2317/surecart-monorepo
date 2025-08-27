// app/(marketing)/privacy/page.tsx
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="bg-white py-12">
      <main className="container mx-auto px-4 py-16 text-slate-700 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
            <p className="mt-2 text-lg text-slate-600">Last updated: August 14, 2025</p>
          </div>

          <div className="prose prose-slate max-w-none prose-p:text-slate-700 prose-a:text-teal-600 hover:prose-a:text-teal-700">
            <p>
              Welcome to Stash. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
            
            <h2>1. Collection of Your Information</h2>
            <p>
              We may collect information about you in a variety of ways. The information we may collect on the Site includes:
            </p>
            <ul>
                <li>
                    <strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and demographic information, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site, such as chat, posting messages in comment sections, or liking posts.
                </li>
                <li>
                    <strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
                </li>
            </ul>

            <h2>2. Use of Your Information</h2>
            <p>
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
            </p>
            <ul>
                <li>Create and manage your account.</li>
                <li>Email you regarding your account or order.</li>
                <li>Enable user-to-user communications.</li>
                <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
            </ul>

            <h2>3. Disclosure of Your Information</h2>
            <p>
                We may share information we have collected about you in certain situations. Your information may be disclosed as follows: by law or to protect rights, if we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.
            </p>

            <p className="mt-8 p-4 bg-slate-100 rounded-lg">
                <strong>Disclaimer:</strong> This is a template and not legal advice. You should consult with a legal professional to ensure your Privacy Policy is compliant with all applicable laws and regulations.
            </p>

          </div>
        </div>
      </main>
    </div>
  );
}