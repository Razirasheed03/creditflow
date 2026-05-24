import { createServerSupabase } from "@/lib/supabase/server";
import { isValidShareId, sanitizeEmail, sanitizeText } from "@/lib/security/sanitize";
import type {
  AuditInsert,
  AuditLeadUpdate,
  AuditRow,
  EstimatedSavings,
} from "@/types/database";
import type { AuditFormValues, AuditResult } from "@/types/audit";

import { buildEstimatedSavings } from "./savings";
import { generateShareId } from "./share-id";

const TABLE = "audits";
const DEBUG = process.env.NODE_ENV !== "production";

function logDebug(label: string, payload: Record<string, unknown>) {
  if (!DEBUG) return;
  console.info(`[creditflow:audits] ${label}`, payload);
}

export class AuditRepositoryError extends Error {
  constructor(
    message: string,
    public readonly code: "not_found" | "conflict" | "database" = "database",
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AuditRepositoryError";
  }
}

function formatSupabaseError(error: {
  message?: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
}): string {
  const parts = [error.message, error.code, error.details, error.hint].filter(
    Boolean
  );
  return parts.join(" — ") || "Unknown database error";
}

export async function createAuditRecord(input: {
  auditData: AuditFormValues;
  resultData: AuditResult;
}): Promise<{ shareId: string; id: string }> {
  const supabase = createServerSupabase();
  const estimatedSavings = buildEstimatedSavings(input.resultData);

  logDebug("createAuditRecord:start", {
    teamSize: input.auditData.teamSize,
    toolCount: input.auditData.tools.length,
    estimatedSavings,
  });

  for (let attempt = 0; attempt < 3; attempt++) {
    const shareId = generateShareId();
    const row: AuditInsert = {
      share_id: shareId,
      audit_data: input.auditData,
      result_data: input.resultData,
      estimated_savings: estimatedSavings,
    };

    logDebug("createAuditRecord:insert", { shareId, attempt: attempt + 1 });

    const { data, error } = await supabase
      .from(TABLE)
      .insert(row)
      .select("id, share_id")
      .single();

    if (!error && data) {
      logDebug("createAuditRecord:success", {
        shareId: data.share_id,
        id: data.id,
      });
      return { shareId: data.share_id, id: data.id };
    }

    logDebug("createAuditRecord:error", {
      shareId,
      attempt: attempt + 1,
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
    });

    if (error?.code === "23505") continue;

    throw new AuditRepositoryError(formatSupabaseError(error ?? {}), "database", {
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });
  }

  throw new AuditRepositoryError("Could not generate unique share id", "conflict");
}

export async function getAuditByShareId(
  shareId: string
): Promise<AuditRow | null> {
  if (!isValidShareId(shareId)) return null;

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("share_id", shareId)
    .maybeSingle();

  if (error) {
    logDebug("getAuditByShareId:error", { shareId, error: error.message });
    throw new AuditRepositoryError(formatSupabaseError(error), "database", {
      code: error.code,
    });
  }

  return data as AuditRow | null;
}

export async function updateAuditLead(
  shareId: string,
  lead: AuditLeadUpdate
): Promise<AuditRow> {
  if (!isValidShareId(shareId)) {
    throw new AuditRepositoryError("Invalid share id", "not_found");
  }

  const email = sanitizeEmail(lead.email);
  if (!email) {
    throw new AuditRepositoryError("Invalid email address", "database");
  }

  const supabase = createServerSupabase();
  logDebug("updateAuditLead", { shareId, email });

  const { data, error } = await supabase
    .from(TABLE)
    .update({
      email,
      company_name: lead.company_name
        ? sanitizeText(lead.company_name, 120)
        : null,
      role: lead.role ? sanitizeText(lead.role, 80) : null,
    })
    .eq("share_id", shareId)
    .select("*")
    .single();

  if (error || !data) {
    logDebug("updateAuditLead:error", {
      shareId,
      code: error?.code,
      message: error?.message,
    });
    throw new AuditRepositoryError(
      formatSupabaseError(error ?? { message: "Audit not found" }),
      error?.code === "PGRST116" ? "not_found" : "database",
      { code: error?.code }
    );
  }

  logDebug("updateAuditLead:success", { shareId, id: data.id });
  return data as AuditRow;
}

export function getPublicSavingsLabel(savings: EstimatedSavings): string {
  if (savings.annual <= 0) {
    return "AI Spend Audit by CreditFlow";
  }
  return `Saved $${Math.round(savings.annual).toLocaleString("en-US")}/year on AI tooling`;
}
