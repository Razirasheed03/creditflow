import { Resend } from "resend";

import type { AuditRow } from "@/types/database";

import { buildAuditSummaryEmail } from "./templates/audit-summary";

const DEBUG = process.env.NODE_ENV !== "production";

function logEmailEvent(
  event: string,
  payload: Record<string, unknown>
) {
  if (!DEBUG) return;
  console.info(`[creditflow:email] ${event}`, payload);
}

export type SendAuditEmailResult =
  | { ok: true; id: string }
  | { ok: false; reason: "not_configured" | "send_failed"; message?: string };

export async function sendAuditSummaryEmail(
  row: AuditRow
): Promise<SendAuditEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const to = row.email?.trim();

  if (!apiKey || !from) {
    logEmailEvent("skipped_not_configured", {
      shareId: row.share_id,
      hasApiKey: Boolean(apiKey),
      hasFrom: Boolean(from),
    });
    return { ok: false, reason: "not_configured" };
  }

  if (!to) {
    logEmailEvent("skipped_missing_recipient", {
      shareId: row.share_id,
    });
    return { ok: false, reason: "send_failed", message: "No recipient email" };
  }

  const { subject, html, text } = buildAuditSummaryEmail(row);
  const resend = new Resend(apiKey);

  try {
    logEmailEvent("send_attempt", {
      shareId: row.share_id,
      to,
      from,
      subject,
      annualSavings: row.estimated_savings.annual,
    });

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    if (error || !data?.id) {
      logEmailEvent("send_error", {
        shareId: row.share_id,
        to,
        message: error?.message ?? "Resend rejected the email",
      });
      return {
        ok: false,
        reason: "send_failed",
        message: error?.message ?? "Resend rejected the email",
      };
    }

    logEmailEvent("send_success", {
      shareId: row.share_id,
      to,
      resendId: data.id,
    });
    return { ok: true, id: data.id };
  } catch (err) {
    logEmailEvent("send_exception", {
      shareId: row.share_id,
      to,
      message: err instanceof Error ? err.message : "Unknown email error",
    });
    return {
      ok: false,
      reason: "send_failed",
      message: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}
