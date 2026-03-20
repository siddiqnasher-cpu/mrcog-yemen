// Supabase configuration

const SUPABASE_URL = 'https://zprzetmchppfeddgcrkf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3B9XdBcZfmJfygRYf-x24A_IUHuzXC4';

if (typeof window.supabase === 'undefined') {
    console.error('Supabase SDK not loaded. Please include the Supabase script in your HTML.');
}

const supabaseClient =
    typeof window.supabase !== 'undefined'
        ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
        : null;

window.supabaseClient = supabaseClient;
