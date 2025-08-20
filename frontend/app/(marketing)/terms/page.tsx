// app/(marketing)/terms/page.tsx
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="bg-white py-12">
      <main className="container mx-auto px-4 py-16 text-slate-700 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Terms of Service</h1>
            <p className="mt-2 text-lg text-slate-600">Last updated: August 14, 2025</p>
          </div>

          <div className="prose prose-slate max-w-none prose-p:text-slate-700 prose-a:text-teal-600 hover:prose-a:text-teal-700">
            <h2>1. Agreement to Terms</h2>
            <p>
              By using our services (Services), you agree to be bound by these Terms. If you do not agree to be bound by these Terms, do not use the Services. If you are accessing and using the Services on behalf of a company (such as your employer) or other legal entity, you represent and warrant that you have the authority to bind that entity to these Terms.
            </p>

            <h2>2. User Accounts</h2>
            <p>
              You may need to create an account to use some of our Services. You are responsible for safeguarding your account, so use a strong password and limit its use to this account. We cannot and will not be liable for any loss or damage arising from your failure to comply with the above.
            </p>

            <h2>3. Content on the Services</h2>
            <p>
              You are responsible for your use of the Services and for any content you provide, including compliance with applicable laws, rules, and regulations. You should only provide content that you are comfortable sharing with others.
            </p>

            <h2>4. Termination</h2>
            <p>
                We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms. Upon termination, your right to use the Services will cease immediately.
            </p>
            
            <p className="mt-8 p-4 bg-slate-100 rounded-lg">
                <strong>Disclaimer:</strong> This is a template and not legal advice. You should consult with a legal professional to ensure your Terms of Service are complete and legally sound for your specific business.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}