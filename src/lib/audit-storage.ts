import {
  migrateAuditFormValues,
  type AuditFormSchema,
} from "@/lib/audit-schema";
import { getPublicShareUrl } from "@/lib/share/share-url";
import type { AuditFormValues, AuditResult } from "@/types/audit";

const DRAFT_KEY = "creditflow_audit_draft";
const INPUT_KEY = "creditflow_audit_input";
const RESULTS_KEY = "creditflow_audit_results";
const SHARE_ID_KEY = "creditflow_share_id";
const LEAD_SUBMITTED_KEY = "creditflow_lead_submitted";

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

export function saveAuditInput(values: AuditFormSchema): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(INPUT_KEY, JSON.stringify(values));
}

export function loadAuditInput(): AuditFormSchema | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(INPUT_KEY);
    if (!raw) return null;
    return migrateAuditFormValues(JSON.parse(raw) as AuditFormValues);
  } catch {
    return null;
  }
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

export function saveShareId(shareId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SHARE_ID_KEY, shareId);
}

export function loadShareId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SHARE_ID_KEY);
}

export function markLeadSubmitted(shareId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LEAD_SUBMITTED_KEY, shareId);
}

export function hasSubmittedLead(shareId: string): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(LEAD_SUBMITTED_KEY) === shareId;
}

/** @deprecated Use `getPublicShareUrl` from `@/lib/share/share-url`. */
export function getShareUrl(shareId: string): string {
  return getPublicShareUrl(shareId);
}
