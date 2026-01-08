import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: verify env vars are being read at runtime (do NOT log keys)
console.log('[supabase.ts] Loaded VITE_SUPABASE_URL:', supabaseUrl);
console.log('[supabase.ts] VITE_SUPABASE_ANON_KEY present:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[supabase.ts] Missing Supabase environment variables. Check .env.local.');
  throw new Error('Missing Supabase environment variables. Please check .env.local file.');
}

console.log('[supabase.ts] Creating Supabase client...');
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('[supabase.ts] Supabase client created successfully');
