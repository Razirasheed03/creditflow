import { NextResponse } from "next/server";

import { getSupabaseEnvDiagnostics } from "@/lib/supabase/env";

/** Dev helper: GET /api/audits/health — confirms env vars are loaded (no secrets returned). */
export async function GET() {
  const diag = getSupabaseEnvDiagnostics();
  return NextResponse.json({
    ok: diag.configured,
    ...diag,
  });
}
