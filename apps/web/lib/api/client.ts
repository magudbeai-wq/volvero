import axios from 'axios';
import { createClient } from '@/utils/supabase/client';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach Supabase token
api.interceptors.request.use(async (config) => {
  try {
    if (typeof window !== 'undefined') {
      // 1. Check window token first (fast path)
      let token = (window as Window & { __supabaseToken?: string }).__supabaseToken;
      
      // 2. Fetch dynamically from Supabase client if not yet synced (prevents initial load race conditions)
      if (!token) {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          token = session.access_token;
          (window as Window & { __supabaseToken?: string }).__supabaseToken = token;
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // No auth context
  }
  return config;
});

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/sign-in') && !window.location.pathname.startsWith('/sign-up')) {
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
