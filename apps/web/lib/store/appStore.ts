import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  fullName: string;
  profilePhoto?: string;
  subscriptionTier: 'FREE' | 'PREMIUM' | 'GOLD';
  isVerified: boolean;
  profileCompletion: number;
  isProfileComplete: boolean;
  matchCount: number;
}

interface AppState {
  // User
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  updateUser: (updates: Partial<UserProfile>) => void;

  // Unread counts
  unreadMessages: number;
  unreadNotifications: number;
  setUnreadMessages: (count: number) => void;
  setUnreadNotifications: (count: number) => void;
  incrementUnread: (type: 'messages' | 'notifications') => void;

  // App state
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;

  // Discover filters
  discoverFilters: {
    minAge: number;
    maxAge: number;
    maxDistance: number;
    religion?: string;
    relationshipGoal?: string;
  };
  setDiscoverFilters: (filters: Partial<AppState['discoverFilters']>) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS = {
  minAge: 18,
  maxAge: 50,
  maxDistance: 100,
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        setUser: (user) => set({ user }),
        updateUser: (updates) =>
          set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null,
          })),

        unreadMessages: 0,
        unreadNotifications: 0,
        setUnreadMessages: (count) => set({ unreadMessages: count }),
        setUnreadNotifications: (count) => set({ unreadNotifications: count }),
        incrementUnread: (type) =>
          set((state) => ({
            [type === 'messages' ? 'unreadMessages' : 'unreadNotifications']:
              state[type === 'messages' ? 'unreadMessages' : 'unreadNotifications'] + 1,
          })),

        isOnline: true,
        setIsOnline: (online) => set({ isOnline: online }),

        discoverFilters: DEFAULT_FILTERS,
        setDiscoverFilters: (filters) =>
          set((state) => ({
            discoverFilters: { ...state.discoverFilters, ...filters },
          })),
        resetFilters: () => set({ discoverFilters: DEFAULT_FILTERS }),
      }),
      {
        name: 'volvero-store',
        partialize: (state) => ({
          user: state.user,
          discoverFilters: state.discoverFilters,
        }),
      }
    ),
    { name: 'VOLVERO' }
  )
);
