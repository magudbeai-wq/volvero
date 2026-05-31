import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | VOLVERO',
  description: 'Terms of Service and usage guidelines for the VOLVERO dating platform.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#0B1020' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-black font-display text-white mb-4">Terms of Service</h1>
          <p className="text-[#94A3B8]">Last Updated: December 2025</p>
        </div>

        <div 
          className="rounded-3xl p-8 sm:p-12 backdrop-blur-xl"
          style={{ 
            background: 'rgba(19,26,43,0.7)', 
            border: '1px solid rgba(124,58,237,0.2)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.3)'
          }}
        >
          <div className="prose prose-invert prose-purple max-w-none">
            <p className="text-[#94A3B8] text-lg mb-8 leading-relaxed">
              Welcome to VOLVERO. These Terms of Service ("Terms") constitute a legally binding agreement made between you and VOLVERO concerning your access to and use of our mobile applications, websites, and any other services provided by VOLVERO.
            </p>

            <div className="w-full h-px my-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.5), transparent)' }} />

            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-[#94A3B8] mb-8 leading-relaxed">
              By creating a VOLVERO account, you agree to be bound by these Terms. If you do not agree with all of these Terms, then you are expressly prohibited from using the Site and Services and you must discontinue use immediately.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">2. Eligibility</h2>
            <p className="text-[#94A3B8] mb-8 leading-relaxed">
              You must be at least 18 years of age to create an account on VOLVERO and use the Service. By creating an account, you represent and warrant that you can form a binding contract with VOLVERO, you are not a person who is barred from using the Service under the laws of any applicable jurisdiction, and you will comply with these Terms and all applicable local, state, national, and international laws, rules, and regulations.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">3. User Conduct and Rules</h2>
            <p className="text-[#94A3B8] mb-6 leading-relaxed">
              You agree that you will not use the Service for any purpose that is illegal or prohibited by these Terms. You agree that you will not:
            </p>
            <ul className="list-disc pl-6 text-[#94A3B8] mb-8 space-y-2">
              <li>Use the Service for any harmful or nefarious purpose.</li>
              <li>Use the Service in order to damage VOLVERO.</li>
              <li>Spam, solicit money from or defraud any members.</li>
              <li>Impersonate any person or entity or post any images of another person without his or her permission.</li>
              <li>Bully, stalk, intimidate, assault, harass, mistreat or defame any person.</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mb-4">4. Content and Intellectual Property</h2>
            <p className="text-[#94A3B8] mb-8 leading-relaxed">
              While you retain ownership of the content you upload to VOLVERO, you grant us a worldwide, transferable, sub-licensable, royalty-free, right and license to host, store, use, copy, display, reproduce, adapt, edit, publish, modify and distribute information you authorize us to access, as well as any information you post, upload, display or otherwise make available on the Service.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">5. Subscriptions and Payments</h2>
            <p className="text-[#94A3B8] mb-8 leading-relaxed">
              If you purchase an auto-recurring periodic subscription through an in-app purchase, your account will be billed continuously for the subscription until you cancel. After your initial subscription commitment period, and again after any subsequent subscription period, your subscription will automatically continue for an additional equivalent period.
            </p>

            <div className="w-full h-px my-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(236,72,153,0.5), transparent)' }} />

            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-[#94A3B8] mb-4">
              If you have any questions concerning these Terms, please contact us at:
            </p>
            <p className="font-semibold" style={{ color: '#7C3AED' }}>
              legal@volvero.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
