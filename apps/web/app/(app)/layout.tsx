import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'VOLVERO App',
};

import { SocketProvider } from '@/components/providers/SocketProvider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <AppShell>{children}</AppShell>
    </SocketProvider>
  );
}
