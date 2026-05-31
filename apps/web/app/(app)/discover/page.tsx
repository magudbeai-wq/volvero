import type { Metadata } from 'next';
import SwipeStack from '@/components/swipe/SwipeStack';

export const metadata: Metadata = {
  title: 'Discover — VOLVERO',
  description: 'Discover compatible singles near you with smart matching.',
};

export default function DiscoverPage() {
  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col">
      <SwipeStack />
    </div>
  );
}
