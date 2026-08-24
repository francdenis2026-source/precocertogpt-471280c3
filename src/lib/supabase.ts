// Cliente Supabase do PreçoCerto — projeto externo e independente.
// A URL e a chave publicável são valores públicos por design (a proteção real é RLS).
// A senha do banco / service_role NUNCA devem aparecer no frontend.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://kqueiohjadwzxafdrnxk.supabase.co";

export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxdWVpb2hqYWR3enhhZmRycnhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxOTI2NzAsImV4cCI6MjEwMTc2ODY3MH0.JB3FxISkHe44rACjtG96hYpwnQwUMtCj6MQYvcRCrqA";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

/**
 * Instância única do cliente. Retorna `null` quando as credenciais não estão
 * definidas, para que a interface possa cair no catálogo local sem quebrar.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
