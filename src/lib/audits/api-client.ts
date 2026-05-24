import type { AuditFormSchema } from "@/lib/audit-schema";
import type { AuditResult } from "@/types/audit";

export type CreateAuditResponse = { shareId: string };

export type LeadCaptureResponse = {
  ok: boolean;
  emailSent?: boolean;
  emailStatus?: string;
};

export async function persistAuditToServer(input: {
  auditData: AuditFormSchema;
  resultData: AuditResult;
}): Promise<CreateAuditResponse> {
  const response = await fetch("/api/audits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auditData: input.auditData,
      resultData: input.resultData,
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
      hint?: string;
      details?: unknown;
    };
    const detail =
      typeof body.details === "object" && body.details !== null
        ? ` (${JSON.stringify(body.details)})`
        : "";
    throw new Error(
      [body.error ?? "Failed to save audit", body.hint].filter(Boolean).join(" — ") +
        detail
    );
  }

  return response.json() as Promise<CreateAuditResponse>;
}

export async function submitLeadCapture(input: {
  shareId: string;
  email: string;
  companyName?: string;
  role?: string;
}): Promise<LeadCaptureResponse> {
  const response = await fetch(`/api/audits/${encodeURIComponent(input.shareId)}/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      shareId: input.shareId,
      email: input.email,
      companyName: input.companyName,
      role: input.role,
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Failed to submit");
  }

  return response.json() as Promise<LeadCaptureResponse>;
}
