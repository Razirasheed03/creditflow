import { NextResponse } from "next/server";

import {
  AuditRepositoryError,
  createAuditRecord,
  createAuditSchema,
} from "@/lib/audits";
import { getSupabaseEnvDiagnostics } from "@/lib/supabase/env";

const DEBUG = process.env.NODE_ENV !== "production";

export async function POST(request: Request) {
  const diag = getSupabaseEnvDiagnostics();

  if (!diag.configured) {
    const message = `Supabase not configured. Missing: ${diag.missing.join(", ")}`;
    console.error("[creditflow:api/audits]", message);
    return NextResponse.json(
      {
        error: message,
        hint: "Add variables to .env.local and restart the dev server.",
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    if (DEBUG) {
      console.info("[creditflow:api/audits] POST received", {
        teamSize: body?.auditData?.teamSize,
        toolCount: body?.auditData?.tools?.length,
        hasResult: Boolean(body?.resultData),
      });
    }

    if (typeof body?.website === "string" && body.website.trim().length > 0) {
      return NextResponse.json({ ok: true, shareId: "blocked" }, { status: 200 });
    }

    const parsed = createAuditSchema.safeParse(body);
    if (!parsed.success) {
      console.warn("[creditflow:api/audits] validation failed", parsed.error.flatten());
      return NextResponse.json(
        { error: "Invalid audit payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { auditData, resultData } = parsed.data;
    const { shareId, id } = await createAuditRecord({ auditData, resultData });

    if (DEBUG) {
      console.info("[creditflow:api/audits] insert success", { shareId, id });
    }

    return NextResponse.json({ shareId }, { status: 201 });
  } catch (error) {
    if (error instanceof AuditRepositoryError) {
      console.error("[creditflow:api/audits] repository error", {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      return NextResponse.json(
        {
          error: error.message,
          ...(DEBUG ? { details: error.details } : {}),
        },
        { status: 500 }
      );
    }

    console.error("[creditflow:api/audits] unexpected error", error);
    return NextResponse.json(
      {
        error: "Failed to save audit",
        ...(DEBUG && error instanceof Error ? { message: error.message } : {}),
      },
      { status: 500 }
    );
  }
}
