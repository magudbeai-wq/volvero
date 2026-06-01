'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Loader2, Phone, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/discover`,
      },
    });

    if (error) {
      toast.error(error.message);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      router.push('/discover');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4" style={{ backgroundColor: '#0B1020' }}>
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1020]/80 via-transparent to-[#0B1020]" />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #7C3AED 0%, #EC4899 50%, transparent 100%)' }}
        />
      </div>

      <div
        className="w-full max-w-md p-8 rounded-3xl relative z-10 backdrop-blur-xl"
        style={{
          background: 'rgba(19,26,43,0.7)',
          border: '1px solid rgba(124,58,237,0.3)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4), 0 0 40px rgba(124,58,237,0.1)',
        }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl overflow-hidden">
            <Image src="/logo.png" alt="VOLVERO Logo" width={64} height={64} className="object-cover" />
          </div>
          <h1 className="text-3xl font-black font-display text-white mb-2">Welcome Back</h1>
          <p style={{ color: '#94A3B8' }}>Sign in to VOLVERO</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-white focus:outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(124,58,237,0.2)',
              }}
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-white focus:outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(124,58,237,0.2)',
              }}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-6 flex justify-center items-center gap-2 rounded-2xl font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #9333EA, #EC4899)',
              boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
            }}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid rgba(124,58,237,0.15)' }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3" style={{ background: 'rgba(19,26,43,1)', color: '#94A3B8' }}>Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-white hover:scale-[1.02] transition-all font-medium"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(124,58,237,0.2)',
              }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: '#94A3B8' }}>
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="font-semibold transition-colors hover:text-white" style={{ color: '#EC4899' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
