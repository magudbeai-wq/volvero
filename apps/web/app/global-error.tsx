'use client';

import { useEffect } from 'react';
import { Heart, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          className="min-h-screen flex items-center justify-center p-6"
          style={{
            background: 'linear-gradient(135deg, #030311, #1a0a2e, #030311)',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <div className="text-center max-w-md">
            <div
              className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <Heart className="w-10 h-10" style={{ color: '#ef4444' }} />
            </div>
            <h1
              className="text-3xl font-black mb-3"
              style={{ color: '#f3f4f6', fontFamily: 'Syne, sans-serif' }}
            >
              Something went wrong
            </h1>
            <p className="text-sm mb-8" style={{ color: '#9ca3af' }}>
              We hit an unexpected error. Don&apos;t worry — your data is safe.
              Please try again or contact support.
            </p>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
