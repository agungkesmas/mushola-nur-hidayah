/**
 * Supabase client for Mushola Nur Hidayah app.
 * Reads credentials from Vite env vars (must be prefixed with VITE_).
 *
 * On Vercel, set these in Project Settings > Environment Variables:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 *
 * For server-side (serverless functions), use SUPABASE_SERVICE_ROLE_KEY
 * (without VITE_ prefix) for privileged operations.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ??
  "";

const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ??
  "";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return _client;
}

/** Default mosque profile used as fallback before fetching from Supabase. */
export const MUSHOLA_PROFILE = {
  name: "Mushola Nur Hidayah",
  address: "Griya Lurah Asri",
  timezone: "Asia/Jakarta",
} as const;
