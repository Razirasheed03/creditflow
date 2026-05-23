import { migrateAuditFormValues } from "@/lib/audit-schema";
import type { AuditFormValues, AuditResult } from "@/types/audit";

const DRAFT_KEY = "creditflow_audit_draft";
const RESULTS_KEY = "creditflow_audit_results";

export function saveAuditDraft(values: AuditFormValues): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
}

export function loadAuditDraft(): AuditFormValues | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuditFormValues;
    return migrateAuditFormValues(parsed);
  } catch {
    return null;
  }
}

export function clearAuditDraft(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DRAFT_KEY);
}

export function saveAuditResults(result: AuditResult): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RESULTS_KEY, JSON.stringify(result));
}

export function loadAuditResults(): AuditResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(RESULTS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuditResult;
  } catch {
    return null;
  }
}
