import { Resend } from "resend";

import type { AuditRow } from "@/types/database";

import { buildAuditSummaryEmail } from "./templates/audit-summary";

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
    return { ok: false, reason: "not_configured" };
  }

  if (!to) {
    return { ok: false, reason: "send_failed", message: "No recipient email" };
  }

  const { subject, html, text } = buildAuditSummaryEmail(row);
  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    if (error || !data?.id) {
      return {
        ok: false,
        reason: "send_failed",
        message: error?.message ?? "Resend rejected the email",
      };
    }

    return { ok: true, id: data.id };
  } catch (err) {
    return {
      ok: false,
      reason: "send_failed",
      message: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}
