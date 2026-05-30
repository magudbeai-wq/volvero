import Link from 'next/link';
import { Heart, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #030311, #1a0a2e, #030311)' }}
    >
      <div className="text-center max-w-md">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div
            className="text-[140px] font-black leading-none select-none"
            style={{
              fontFamily: 'Syne, sans-serif',
              background: 'linear-gradient(135deg, #7c3aed, #2563eb, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              opacity: 0.15,
            }}
          >
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{
                background: 'rgba(139,92,246,0.15)',
                border: '1px solid rgba(139,92,246,0.3)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <Heart className="w-10 h-10" style={{ color: '#a78bfa' }} />
            </div>
          </div>
        </div>

        <h1
          className="text-3xl font-black mb-3"
          style={{ color: '#f3f4f6', fontFamily: 'Syne, sans-serif' }}
        >
          Page Not Found
        </h1>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: '#9ca3af' }}>
          This page doesn&apos;t exist — but your perfect match might be waiting
          on the app. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
              boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
            }}
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/discover"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-105"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#d1d5db',
            }}
          >
            <Search className="w-4 h-4" />
            Discover Matches
          </Link>
        </div>
      </div>
    </div>
  );
}
