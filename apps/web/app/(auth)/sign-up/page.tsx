'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Loader2, Phone, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/discover`,
      }
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success('Account created! Welcome to VOLVERO 💜');
      router.push('/onboarding');
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
          style={{ background: 'radial-gradient(circle, #EC4899 0%, #7C3AED 50%, transparent 100%)' }}
        />
      </div>

      <div
        className="w-full max-w-md p-8 rounded-3xl relative z-10 backdrop-blur-xl"
        style={{
          background: 'rgba(19,26,43,0.7)',
          border: '1px solid rgba(236,72,153,0.3)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4), 0 0 40px rgba(236,72,153,0.1)',
        }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl overflow-hidden">
            <Image src="/logo.png" alt="VOLVERO Logo" width={64} height={64} className="object-cover" />
          </div>
          <h1 className="text-3xl font-black font-display text-white mb-2">Join VOLVERO</h1>
          <p style={{ color: '#94A3B8' }}>Start finding meaningful connections</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-white focus:outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(236,72,153,0.2)',
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
                border: '1px solid rgba(236,72,153,0.2)',
              }}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-6 flex justify-center items-center gap-2 rounded-2xl font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, #EC4899, #9333EA, #7C3AED)',
              boxShadow: '0 4px 24px rgba(236,72,153,0.4)',
            }}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid rgba(236,72,153,0.15)' }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3" style={{ background: 'rgba(19,26,43,1)', color: '#94A3B8' }}>Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => toast('Phone authentication coming soon!')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white hover:scale-[1.02] transition-all font-medium"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(236,72,153,0.2)',
              }}
            >
              <Phone className="w-5 h-5" />
              Phone Number
            </button>
          </div>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: '#94A3B8' }}>
          Already have an account?{' '}
          <Link href="/sign-in" className="font-semibold transition-colors hover:text-white" style={{ color: '#7C3AED' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
