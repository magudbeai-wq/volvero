import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #030311 0%, #1a0a2e 50%, #0d1b4b 100%)' }}
    >
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-[rgba(22,22,48,0.9)] border border-[rgba(139,92,246,0.25)] shadow-2xl rounded-3xl',
            headerTitle: 'font-display text-white',
            headerSubtitle: 'text-gray-400',
            socialButtonsBlockButton: 'rounded-2xl border-white/10 hover:bg-white/5',
            formFieldInput: 'rounded-xl bg-white/5 border-white/10 text-white',
            formButtonPrimary: 'rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#2563eb] hover:opacity-90',
            footerAction: 'text-gray-400',
            footerActionLink: 'text-[#a78bfa] hover:text-[#8b5cf6]',
          },
          variables: {
            colorBackground: 'transparent',
            colorText: '#f3f4f6',
            colorPrimary: '#7c3aed',
            borderRadius: '0.75rem',
          },
        }}
      />
    </div>
  );
}
