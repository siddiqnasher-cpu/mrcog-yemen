// Supabase configuration
// IMPORTANT: Replace with your actual Supabase URL and Anon Key
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

if (typeof supabase === 'undefined') {
    console.error('Supabase SDK not loaded. Please include the Supabase script in your HTML.');
}

const supabaseClient = typeof supabase !== 'undefined' ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

window.supabaseClient = supabaseClient;
