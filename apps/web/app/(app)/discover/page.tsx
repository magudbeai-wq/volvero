import type { Metadata } from 'next';
import SwipeStack from '@/components/swipe/SwipeStack';

export const metadata: Metadata = {
  title: 'Discover — LAMAANE DOORE',
  description: 'Discover compatible Somali singles near you with AI-powered matching.',
};

export default function DiscoverPage() {
  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col">
      <SwipeStack />
    </div>
  );
}
