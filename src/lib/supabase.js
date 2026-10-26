// Cliente Supabase do app. SDK importado via esm.sh (sem npm install) —
// Vite resolve o import no build e inclui no bundle.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error('Supabase env vars missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
}

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
