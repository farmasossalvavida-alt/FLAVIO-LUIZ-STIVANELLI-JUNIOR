// Supabase Client configurado para Lovable / Supabase
// Lê variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const supabaseConfig: SupabaseConfig = {
  url: envUrl,
  anonKey: envKey,
  isConfigured: Boolean(envUrl && envKey),
};
