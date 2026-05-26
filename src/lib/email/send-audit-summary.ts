import { BrevoClient } from "@getbrevo/brevo";

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
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const fromName = process.env.BREVO_SENDER_NAME?.trim();
  const fromEmail = process.env.BREVO_SENDER_EMAIL?.trim();
  const to = row.email?.trim();

  if (!apiKey || !fromName || !fromEmail) {
    logEmailEvent("skipped_not_configured", {
      shareId: row.share_id,
      hasApiKey: Boolean(apiKey),
      hasFromName: Boolean(fromName),
      hasFromEmail: Boolean(fromEmail),
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
  const brevo = new BrevoClient({
    apiKey,
    timeoutInSeconds: 30,
    maxRetries: 2,
  });

  try {
    logEmailEvent("send_attempt", {
      shareId: row.share_id,
      to,
      from: `${fromName} <${fromEmail}>`,
      subject,
      annualSavings: row.estimated_savings.annual,
    });

    const response = await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent: html,
      textContent: text,
      sender: {
        name: fromName,
        email: fromEmail,
      },
      to: [{ email: to }],
    });

    const providerResponse =
      response && typeof response === "object"
        ? JSON.parse(JSON.stringify(response))
        : response;
    logEmailEvent("send_success", {
      shareId: row.share_id,
      to,
      providerResponse,
    });

    const id =
      typeof providerResponse === "object" &&
      providerResponse !== null &&
      "messageId" in providerResponse
        ? String((providerResponse as { messageId?: unknown }).messageId ?? "")
        : "";

    return { ok: true, id: id || "brevo_sent" };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown email error";
    const details =
      err && typeof err === "object"
        ? JSON.parse(JSON.stringify(err))
        : undefined;
    logEmailEvent("send_exception", {
      shareId: row.share_id,
      to,
      message,
      details,
    });
    return {
      ok: false,
      reason: "send_failed",
      message,
    };
  }
}
