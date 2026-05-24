/**
 * Resolves Supabase env vars across legacy (JWT) and new (sb_*) key names.
 * @see https://supabase.com/docs/guides/api/api-keys
 */

function firstDefined(...values: (string | undefined)[]): string | undefined {
  return values.find((v) => typeof v === "string" && v.trim().length > 0)?.trim();
}

export type SupabaseServerEnv = {
  url: string;
  secretKey: string;
};

export type SupabasePublicEnv = {
  url: string;
  publishableKey: string;
};

export function getSupabaseServerEnv(): SupabaseServerEnv | null {
  const url = firstDefined(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const secretKey = firstDefined(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_SECRET_KEY
  );

  if (!url || !secretKey) return null;
  return { url, secretKey };
}

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = firstDefined(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = firstDefined(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!url || !publishableKey) return null;
  return { url, publishableKey };
}

export function getSupabaseEnvDiagnostics(): {
  configured: boolean;
  missing: string[];
  urlPresent: boolean;
  secretKeyPresent: boolean;
  publishableKeyPresent: boolean;
} {
  const urlPresent = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  const secretKeyPresent = Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
      process.env.SUPABASE_SECRET_KEY?.trim()
  );
  const publishableKeyPresent = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );

  const missing: string[] = [];
  if (!urlPresent) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!secretKeyPresent) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY (sb_secret_...)");
  }

  return {
    configured: urlPresent && secretKeyPresent,
    missing,
    urlPresent,
    secretKeyPresent,
    publishableKeyPresent,
  };
}
