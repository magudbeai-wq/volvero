'use client';

import { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useAppStore } from '@/lib/store/appStore';

/**
 * Syncs Clerk user token to global window so axios interceptor can use it.
 */
export function useAuthSync() {
  const { getToken } = useAuth();
  const { user: clerkUser, isLoaded } = useUser();
  const { setUser } = useAppStore();

  useEffect(() => {
    if (!isLoaded || !clerkUser) return;

    // Refresh token periodically
    const syncToken = async () => {
      const token = await getToken();
      if (token && typeof window !== 'undefined') {
        (window as Window & { __clerkToken?: string }).__clerkToken = token;
      }
    };

    syncToken();
    const interval = setInterval(syncToken, 4 * 60 * 1000); // Refresh every 4 min

    return () => clearInterval(interval);
  }, [clerkUser, isLoaded, getToken]);
}

export function useCurrentUser() {
  const { user } = useAppStore();
  return user;
}
