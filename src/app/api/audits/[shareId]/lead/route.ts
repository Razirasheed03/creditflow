import { NextResponse } from "next/server";

import {
  AuditRepositoryError,
  getAuditByShareId,
  leadCaptureSchema,
  updateAuditLead,
} from "@/lib/audits";
import { sendAuditSummaryEmail } from "@/lib/email/send-audit-summary";
import { sanitizeEmail, sanitizeText } from "@/lib/security/sanitize";

type RouteContext = { params: Promise<{ shareId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const { shareId: routeShareId } = await context.params;
    const body = await request.json();

    if (typeof body?.website === "string" && body.website.trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    const parsed = leadCaptureSchema.safeParse({
      ...body,
      shareId: body?.shareId ?? routeShareId,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid lead data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const email = sanitizeEmail(parsed.data.email);
    if (!email) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const existing = await getAuditByShareId(parsed.data.shareId);
    if (!existing) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    const row = await updateAuditLead(parsed.data.shareId, {
      email,
      company_name: parsed.data.companyName
        ? sanitizeText(parsed.data.companyName, 120)
        : null,
      role: parsed.data.role ? sanitizeText(parsed.data.role, 120) : null,
    });

    const emailResult = await sendAuditSummaryEmail(row);

    return NextResponse.json({
      ok: true,
      emailSent: emailResult.ok,
      emailStatus: emailResult.ok
        ? "sent"
        : emailResult.reason === "not_configured"
          ? "skipped_not_configured"
          : "failed",
    });
  } catch (error) {
    if (error instanceof AuditRepositoryError) {
      const status = error.code === "not_found" ? 404 : 500;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }
}
