// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Adicione estes logs para depuração
console.log("URL do Supabase carregada:", supabaseUrl);
console.log("Chave Anon do Supabase carregada:", supabaseAnonKey ? "SIM" : "NÃO");

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Credenciais do Supabase não encontradas. Verifique seu arquivo .env e reinicie o servidor.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);