'use client';

import Link from 'next/link';
import { Twitter, Instagram, Facebook, Youtube } from 'lucide-react';
import Image from 'next/image';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Matching', href: '#ai' }
  ],
  Community: [
    { label: 'Blog', href: '/blog' },
    { label: 'Success Stories', href: '/blog' }
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' }
  ]
};

export default function Footer() {
  return (
    <footer
      className="relative pt-20 pb-10"
      style={{
        background: '#0B1020',
        borderTop: '1px solid rgba(124,58,237,0.15)',
      }}
    >
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
              >
                <Image src="/logo.png" alt="VOLVERO Logo" width={40} height={40} className="object-cover" />
              </div>
              <div>
                <div className="font-display font-black text-white text-base">VOLVERO</div>
                <div className="text-xs" style={{ color: '#a78bfa' }}>Connect Beyond Borders</div>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#6b7280' }}>
              The world's most premium dating platform. Find meaningful connections anywhere in the world. 🌍
            </p>

            {/* Social */}
            <div className="flex gap-3">
              {[Twitter, Instagram, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af' }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-white mb-4 text-sm">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: '#6b7280' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div
          className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="text-sm" style={{ color: '#4b5563' }}>
            © 2025 VOLVERO. All rights reserved. Made with 💜 for dreamers worldwide.
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs" style={{ color: '#4b5563' }}>v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
