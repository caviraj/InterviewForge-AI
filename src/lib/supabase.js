import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Vite Supabase URL or Anon Key. Check your root .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
