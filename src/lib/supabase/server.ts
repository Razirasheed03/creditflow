import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseEnvDiagnostics, getSupabaseServerEnv } from "./env";

export function isSupabaseConfigured(): boolean {
  return getSupabaseServerEnv() !== null;
}

export function createServerSupabase(): SupabaseClient {
  const env = getSupabaseServerEnv();

  if (!env) {
    const diag = getSupabaseEnvDiagnostics();
    throw new Error(
      `Supabase is not configured. Missing: ${diag.missing.join(", ")}. ` +
        "Save NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (sb_secret_...) in .env.local, then restart `npm run dev`."
    );
  }

  return createClient(env.url, env.secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
