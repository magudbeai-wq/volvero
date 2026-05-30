'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Users, User, Sparkles, Bell } from 'lucide-react';
import { useAppStore } from '@/lib/store/appStore';
import StoriesBar from '@/components/stories/StoriesBar';
import clsx from 'clsx';

const NAV_ITEMS = [
  { href: '/discover', icon: Heart, label: 'Discover', labelSo: 'Hel' },
  { href: '/matches', icon: Users, label: 'Matches', labelSo: 'Kuxidhxidh' },
  { href: '/messages', icon: MessageCircle, label: 'Messages', labelSo: 'Farriimo' },
  { href: '/profile', icon: User, label: 'Profile', labelSo: 'Profayl' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { unreadMessages, unreadNotifications } = useAppStore();

  return (
    <div
      className="flex min-h-screen"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Sidebar (desktop) */}
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-72 z-40 p-6"
        style={{
          background: 'rgba(10,10,31,0.95)',
          borderRight: '1px solid rgba(139,92,246,0.12)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo */}
        <Link href="/discover" className="flex items-center gap-3 mb-10 group">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
          >
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="font-display font-black text-white text-sm leading-tight">LAMAANE DOORE</div>
            <div className="text-xs" style={{ color: '#6b7280' }}>Find Your Match</div>
          </div>
        </Link>

        {/* Nav items */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            const badge = item.href === '/messages' ? unreadMessages : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 relative group',
                  isActive
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                )}
                style={isActive ? {
                  background: 'rgba(139,92,246,0.15)',
                  border: '1px solid rgba(139,92,246,0.25)',
                } : {}}
              >
                <div className="relative">
                  <Icon className={clsx('w-5 h-5', isActive && 'fill-current')} style={{ color: isActive ? '#a78bfa' : undefined }} />
                  {badge > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                      style={{ background: '#7c3aed' }}
                    >
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                <div>
                  <div className={clsx('text-sm font-semibold', isActive && 'text-white')}>
                    {item.label}
                  </div>
                  <div className="text-xs" style={{ color: '#4b5563' }}>{item.labelSo}</div>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute right-3 w-1.5 h-1.5 rounded-full"
                    style={{ background: '#8b5cf6' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="space-y-1">
          <Link
            href="/premium"
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all"
            style={{
              background: 'rgba(251,191,36,0.1)',
              border: '1px solid rgba(251,191,36,0.2)',
            }}
          >
            <Sparkles className="w-5 h-5" style={{ color: '#fbbf24' }} />
            <div>
              <div className="text-sm font-bold" style={{ color: '#fbbf24' }}>Upgrade to Premium</div>
              <div className="text-xs" style={{ color: '#92400e' }}>Unlimited likes & more</div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main
        className="flex-1 lg:ml-72 pb-20 lg:pb-0 min-h-screen flex flex-col"
        style={{ maxWidth: '100%' }}
      >
        {/* Render StoriesBar only on discover and messages feeds */}
        {(pathname === '/discover' || pathname === '/messages') && (
          <div className="flex-shrink-0 border-b border-white/5 bg-[rgba(10,10,31,0.25)]">
            <StoriesBar />
          </div>
        )}
        <div className="flex-1">
          {children}
        </div>
      </main>

      {/* Bottom navigation (mobile) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-2"
        style={{
          background: 'rgba(3,3,17,0.97)',
          borderTop: '1px solid rgba(139,92,246,0.15)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            const badge = item.href === '/messages' ? unreadMessages : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex flex-col items-center gap-1 p-2 rounded-2xl transition-all min-w-[60px]',
                  isActive ? '' : 'opacity-50'
                )}
              >
                <div className="relative">
                  <Icon
                    className={clsx('w-6 h-6', isActive && 'fill-current')}
                    style={{ color: isActive ? '#a78bfa' : '#9ca3af' }}
                  />
                  {badge > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                      style={{ background: '#7c3aed' }}
                    >
                      {badge}
                    </span>
                  )}
                </div>
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: isActive ? '#a78bfa' : '#6b7280' }}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="bottom-indicator"
                    className="absolute bottom-0 w-8 h-0.5 rounded-full"
                    style={{ background: '#8b5cf6' }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
