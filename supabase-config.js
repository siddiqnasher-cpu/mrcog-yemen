// Supabase configuration

const SUPABASE_URL = 'https://zprzetmchppfeddgcrkf.supabase.co';
const SUPABASE_ANON_KEY = 'ضع-هنا-المفتاح-sb_publishable-كاملًا';

if (typeof window.supabase === 'undefined') {
    console.error('Supabase SDK not loaded. Please include the Supabase script in your HTML.');
}

const supabaseClient =
    typeof window.supabase !== 'undefined'
        ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
        : null;

window.supabaseClient = supabaseClient;
