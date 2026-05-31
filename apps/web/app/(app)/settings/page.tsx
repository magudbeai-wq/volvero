'use client';


import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => api.get('/api/users/me').then(r => r.data),
  });
  
  const user = data?.user;

  const updateSetting = async (field: string, value: boolean | string) => {
    if (!user) return;
    const toastId = toast.loading('Updating settings...');
    try {
      await api.patch('/api/users/me', { [field]: value });
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      toast.success('Settings updated', { id: toastId });
    } catch {
      toast.error('Failed to update settings', { id: toastId });
    }
  };
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/profile" className="p-2 rounded-xl" style={{ color: '#9ca3af' }}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display text-2xl font-black text-white">Settings</h1>
      </div>

      {/* Premium Features */}
      <div className="card p-6 mb-8 border border-[#8b5cf6]/30 bg-[#8b5cf6]/5">
        <h2 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
          <span className="text-[#a78bfa]">★</span> Premium Features
        </h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm text-white">Incognito Mode</div>
              <div className="text-xs mt-0.5 text-gray-400">Hide your profile from Discovery. Only people you swipe right on will see you.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={user?.isIncognito || false} onChange={e => updateSetting('isIncognito', e.target.checked)} />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b5cf6]"></div>
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <div>
              <div className="font-semibold text-sm text-white">Travel Mode (Passport)</div>
              <div className="text-xs mt-0.5 text-gray-400">Swipe in a different city around the world.</div>
            </div>
            <input 
              type="text"
              placeholder="e.g., London, Tokyo, New York"
              className="input-field max-w-sm mt-2"
              value={user?.city || ''}
              onChange={e => {}}
              onBlur={e => updateSetting('city', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Quick Settings */}
      <div className="space-y-4 mb-8">
        {[
          { label: 'Notifications', sub: 'Matches, messages, promotions', href: '#' },
          { label: 'Privacy', sub: 'Who can see your profile', href: '#' },
          { label: 'Billing & Subscription', sub: 'Manage your plan', href: '/premium' },
          { label: 'Language', sub: 'English', href: '#' },
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
        <div className="text-sm text-gray-400">
          Account management (email/password changes) will be available here soon.
        </div>
      </div>
    </div>
  );
}
