'use client';

/**
 * Safe Clerk hooks that work without ClerkProvider (demo mode).
 * When Clerk keys are not configured, these return safe defaults.
 */

// Check at module level if Clerk is available
const clerkKey = typeof window !== 'undefined'
  ? (document.querySelector('meta[name="clerk-key"]')?.getAttribute('content') || '')
  : (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '');

export const isClerkAvailable = clerkKey.startsWith('pk_') && !clerkKey.includes('YOUR_');

export function useSafeUser() {
  if (!isClerkAvailable) {
    return { user: null, isSignedIn: false, isLoaded: true };
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const clerk = require('@clerk/nextjs');
    return clerk.useUser();
  } catch {
    return { user: null, isSignedIn: false, isLoaded: true };
  }
}

export function useSafeAuth() {
  if (!isClerkAvailable) {
    return { getToken: async () => null, userId: null, isLoaded: true };
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const clerk = require('@clerk/nextjs');
    return clerk.useAuth();
  } catch {
    return { getToken: async () => null, userId: null, isLoaded: true };
  }
}
