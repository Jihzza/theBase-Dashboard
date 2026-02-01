import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const SUPABASE_CONFIGURED = Boolean(url && anonKey);

export const supabase = SUPABASE_CONFIGURED ? createClient(url!, anonKey!) : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Ensure Netlify env vars VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set, then redeploy.",
    );
  }
  return supabase;
}
