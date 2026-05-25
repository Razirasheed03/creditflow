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
const DEBUG = process.env.NODE_ENV !== "production";

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

    if (DEBUG) {
      console.info("[creditflow:lead] submission_received", {
        shareId: parsed.data.shareId,
        email,
        hasCompanyName: Boolean(parsed.data.companyName?.trim()),
        hasRole: Boolean(parsed.data.role?.trim()),
      });
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

    if (DEBUG) {
      console.info("[creditflow:lead] audit_updated", {
        shareId: parsed.data.shareId,
        auditId: row.id,
      });
    }

    const emailResult = await sendAuditSummaryEmail(row);

    if (DEBUG) {
      console.info("[creditflow:lead] email_status", {
        shareId: parsed.data.shareId,
        emailSent: emailResult.ok,
        status: emailResult.ok
          ? "sent"
          : emailResult.reason === "not_configured"
            ? "skipped_not_configured"
            : "failed",
        message: !emailResult.ok ? emailResult.message : undefined,
      });
    }

    return NextResponse.json({
      ok: true,
      emailSent: emailResult.ok,
      emailStatus: emailResult.ok
        ? "sent"
        : emailResult.reason === "not_configured"
          ? "skipped_not_configured"
          : "failed",
      emailMessage: !emailResult.ok ? emailResult.message : undefined,
    });
  } catch (error) {
    if (error instanceof AuditRepositoryError) {
      const status = error.code === "not_found" ? 404 : 500;
      if (DEBUG) {
        console.error("[creditflow:lead] repository_error", {
          message: error.message,
          code: error.code,
          details: error.details,
        });
      }
      return NextResponse.json({ error: error.message }, { status });
    }
    if (DEBUG) {
      console.error("[creditflow:lead] unexpected_error", error);
    }
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }
}
