'use client';

import Link from 'next/link';
import { Heart, Twitter, Instagram, Facebook, Youtube } from 'lucide-react';

const FOOTER_LINKS = {
  Product: ['Features', 'How It Works', 'Pricing', 'AI Matching', 'Safety'],
  Community: ['Success Stories', 'Blog', 'Events', 'Referral Program', 'Ambassadors'],
  Support: ['Help Center', 'Contact Us', 'Report a Problem', 'Community Guidelines'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Accessibility'],
};

export default function Footer() {
  return (
    <footer
      className="relative pt-20 pb-10"
      style={{
        background: 'rgba(3,3,17,0.98)',
        borderTop: '1px solid rgba(139,92,246,0.15)',
      }}
    >
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
              >
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <div className="font-display font-black text-white text-base">LAMAANE DOORE</div>
                <div className="text-xs" style={{ color: '#a78bfa' }}>Find Your Perfect Somali Match</div>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#6b7280' }}>
              The world's most premium Somali dating and matchmaking platform. Built with love
              for the global Somali community. 🇸🇴
            </p>
            <p className="text-sm italic mb-6" dir="rtl" style={{ color: '#6b7280' }}>
              منصة المواعدة الصومالية الأكثر فخامة في العالم
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
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: '#6b7280' }}
                    >
                      {link}
                    </a>
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
            © 2024 LAMAANE DOORE. All rights reserved. Made with 💜 for the Somali community.
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
              ● All systems operational
            </span>
            <span className="text-xs" style={{ color: '#4b5563' }}>v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
