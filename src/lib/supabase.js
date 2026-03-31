import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only initialize if we have the credentials, otherwise export a null-safe object or log error
export const supabase = (supabaseUrl && supabaseKey) 
    ? createClient(supabaseUrl, supabaseKey) 
    : { 
        auth: { 
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signInWithOAuth: () => Promise.resolve({ error: { message: 'Supabase not configured' } })
        } 
    };

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials missing in environment. Auth features will be disabled.');
}
