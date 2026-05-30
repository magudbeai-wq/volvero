'use client';

import { UserProfile } from '@clerk/nextjs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/profile" className="p-2 rounded-xl" style={{ color: '#9ca3af' }}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display text-2xl font-black text-white">Settings</h1>
      </div>

      {/* Quick Settings */}
      <div className="space-y-4 mb-8">
        {[
          { label: 'Notifications', sub: 'Matches, messages, promotions', href: '#' },
          { label: 'Privacy', sub: 'Who can see your profile', href: '#' },
          { label: 'Billing & Subscription', sub: 'Manage your plan', href: '/premium' },
          { label: 'Language', sub: 'English, Somali, Arabic', href: '#' },
          { label: 'Dark Mode', sub: 'Currently: Dark', href: '#' },
          { label: 'Blocked Users', sub: 'Manage blocked profiles', href: '#' },
          { label: 'Help & Support', sub: 'FAQ, contact us, report a bug', href: '#' },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center justify-between p-4 rounded-2xl transition-all hover:scale-[1.01]"
            style={{
              background: 'rgba(22,22,48,0.8)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div>
              <div className="font-semibold text-sm text-white">{item.label}</div>
              <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{item.sub}</div>
            </div>
            <svg className="w-4 h-4" style={{ color: '#4b5563' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}

        {/* Danger Zone */}
        <div
          className="p-4 rounded-2xl"
          style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <div className="font-semibold text-sm" style={{ color: '#ef4444' }}>Delete Account</div>
          <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>Permanently remove your data</div>
        </div>
      </div>

      {/* Clerk Account Management */}
      <div className="card p-6">
        <h2 className="font-display font-bold text-lg text-white mb-4">Account</h2>
        <UserProfile
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-transparent shadow-none border-0',
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
    </div>
  );
}
