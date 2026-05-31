import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | VOLVERO',
  description: 'Learn how VOLVERO protects your privacy and secures your personal data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#0B1020' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-black font-display text-white mb-4">Privacy Policy</h1>
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
              At VOLVERO, your privacy is our top priority. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
            </p>

            <div className="w-full h-px my-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.5), transparent)' }} />

            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p className="text-[#94A3B8] mb-6 leading-relaxed">
              We may collect information about you in a variety of ways. The information we may collect via the Application includes:
            </p>
            <ul className="list-disc pl-6 text-[#94A3B8] mb-8 space-y-2">
              <li><strong className="text-white">Personal Data:</strong> Demographics and other personally identifiable information (such as your name and email address) that you voluntarily give to us when choosing to participate in various activities related to the Application.</li>
              <li><strong className="text-white">Profile Data:</strong> Information such as your photos, lifestyle preferences, and relationship goals necessary for matching.</li>
              <li><strong className="text-white">Derivative Data:</strong> Information our servers automatically collect when you access the Application, such as your native actions that are integral to the Application, including liking, re-blogging, or replying to a post.</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
            <p className="text-[#94A3B8] mb-8 leading-relaxed">
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:
              <br /><br />
              • Create and manage your account.<br />
              • Facilitate our smart matching algorithm.<br />
              • Enable user-to-user communications.<br />
              • Monitor and analyze usage and trends to improve your experience.<br />
              • Prevent fraudulent transactions and monitor against theft.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">3. Data Security</h2>
            <p className="text-[#94A3B8] mb-8 leading-relaxed">
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">4. Your Privacy Rights</h2>
            <p className="text-[#94A3B8] mb-8 leading-relaxed">
              You may at any time review or change the information in your account or terminate your account by:
              <br /><br />
              • Logging into your account settings and updating your account.<br />
              • Contacting us using the contact information provided below.
            </p>

            <div className="w-full h-px my-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(236,72,153,0.5), transparent)' }} />

            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-[#94A3B8] mb-4">
              If you have questions or comments about this Privacy Policy, please contact us at:
            </p>
            <p className="font-semibold" style={{ color: '#EC4899' }}>
              privacy@volvero.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
