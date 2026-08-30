const SUPABASE_URL = "SUA_URL_DO_SUPABASE";

const SUPABASE_ANON_KEY = "SUA_CHAVE_PUBLICA_DO_SUPABASE";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);