'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Menu, X } from 'lucide-react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it Works' },
  { href: '#ai', label: 'AI Matching' },
  { href: '#stories', label: 'Stories' },
  { href: '#pricing', label: 'Pricing' },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(3,3,17,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(139,92,246,0.15)' : 'none',
        }}
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-18" style={{ height: '72px' }}>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
              >
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <div className="font-display font-black text-white text-sm leading-none tracking-tight">
                  LAMAANE DOORE
                </div>
                <div className="text-xs" style={{ color: '#a78bfa' }}>Find Your Match</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:text-white"
                  style={{ color: '#9ca3af' }}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* CTA — Clerk Show pattern */}
            <div className="hidden md:flex items-center gap-3">
              {!isLoaded ? (
                <div className="w-20 h-8 rounded-xl shimmer" style={{ background: 'rgba(255,255,255,0.06)' }} />
              ) : isSignedIn ? (
                <div className="flex items-center gap-3">
                  <Link href="/discover" className="btn-primary py-2.5 px-5 text-sm">
                    Open App →
                  </Link>
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: 'w-9 h-9 rounded-xl',
                      },
                    }}
                  />
                </div>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <button
                      className="text-sm font-medium px-4 py-2.5 rounded-xl transition-colors hover:text-white"
                      style={{ color: '#9ca3af' }}
                    >
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="btn-primary py-2.5 px-5 text-sm">
                      Get Started Free
                    </button>
                  </SignUpButton>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl"
              style={{ color: '#9ca3af' }}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[72px] left-0 right-0 z-40 p-4"
            style={{
              background: 'rgba(3,3,17,0.97)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(139,92,246,0.2)',
            }}
          >
            <div className="space-y-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:text-white"
                  style={{ color: '#9ca3af' }}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="mt-4 pt-4 flex flex-col gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {isSignedIn ? (
                <Link href="/discover" onClick={() => setMobileOpen(false)} className="btn-primary text-sm py-3 text-center">
                  Open App →
                </Link>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <button className="btn-secondary text-sm py-3 w-full text-center">Sign In</button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="btn-primary text-sm py-3 w-full text-center">Get Started Free</button>
                  </SignUpButton>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
