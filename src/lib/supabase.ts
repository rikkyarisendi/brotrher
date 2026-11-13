import { createClient } from '@supabase/supabase-js';

/**
 * Konfigurasi koneksi Supabase resmi untuk Brotrher Boots Official.
 * Anda dapat mengganti URL atau Publishable Key melalui file .env
 * (VITE_SUPABASE_URL & VITE_SUPABASE_PUBLISHABLE_KEY) atau langsung di sini.
 */
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://ytfusfndwltgsqymgote.supabase.co';

export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_x0k6uJUbweE_ufKx43j3Uw_Bp2SdVDS';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
