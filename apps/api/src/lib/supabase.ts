import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : {
      auth: {
        getUser: async (token: string) => {
          console.warn('⚠️ Supabase client is unconfigured. Returning mock error response.');
          return { data: { user: null }, error: new Error('Supabase not configured') };
        }
      }
    } as any;
