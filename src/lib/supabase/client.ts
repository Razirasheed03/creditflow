import { createClient } from "@supabase/supabase-js";

import { getSupabasePublicEnv } from "./env";

export function createBrowserSupabase() {
  const env = getSupabasePublicEnv();

  if (!env) {
    throw new Error(
      "Supabase public environment variables are not configured. " +
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local."
    );
  }

  return createClient(env.url, env.publishableKey);
}
