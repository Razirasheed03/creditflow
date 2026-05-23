import type { AuditResult } from "@/types/audit";

import { buildFallbackSummary } from "./fallback";
import type { AuditSummaryResult } from "./types";

const CACHE_PREFIX = "creditflow_audit_summary_";

function cacheKey(audit: AuditResult): string {
  return `${CACHE_PREFIX}${audit.generatedAt}`;
}

export function readCachedSummary(
  audit: AuditResult
): AuditSummaryResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(cacheKey(audit));
    if (!raw) return null;
    return JSON.parse(raw) as AuditSummaryResult;
  } catch {
    return null;
  }
}

export function writeCachedSummary(
  audit: AuditResult,
  summary: AuditSummaryResult
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(cacheKey(audit), JSON.stringify(summary));
  } catch {
    // ignore quota errors
  }
}

export async function fetchAuditSummary(
  audit: AuditResult,
  options?: { refresh?: boolean }
): Promise<AuditSummaryResult> {
  if (!options?.refresh) {
    const cached = readCachedSummary(audit);
    if (cached) return cached;
  }

  try {
    const response = await fetch("/api/audit-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(audit),
    });

    if (!response.ok) {
      throw new Error(`Summary request failed (${response.status})`);
    }

    const summary = (await response.json()) as AuditSummaryResult;
    writeCachedSummary(audit, summary);
    return summary;
  } catch {
    const fallback = buildFallbackSummary(audit);
    writeCachedSummary(audit, fallback);
    return fallback;
  }
}
