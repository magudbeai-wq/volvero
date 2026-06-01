'use client';

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/lib/store/appStore';

/**
 * Syncs Supabase user token to global window so axios interceptor can use it.
 */
export function useAuthSync() {
  const { setUser } = useAppStore();
  const supabase = createClient();

  useEffect(() => {
    const syncToken = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token && typeof window !== 'undefined') {
        (window as Window & { __supabaseToken?: string }).__supabaseToken = session.access_token;
      }
    };

    syncToken();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (session?.access_token && typeof window !== 'undefined') {
        (window as Window & { __supabaseToken?: string }).__supabaseToken = session.access_token;
      } else if (event === 'SIGNED_OUT' && typeof window !== 'undefined') {
        (window as Window & { __supabaseToken?: string }).__supabaseToken = undefined;
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth, setUser]);
}

export function useCurrentUser() {
  const { user } = useAppStore();
  return user;
}
