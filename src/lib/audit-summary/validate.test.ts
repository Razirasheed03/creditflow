import { describe, expect, it } from "vitest";

import { runAudit } from "@/lib/audit-engine";
import { getDemoScenario } from "@/lib/audit-demo-scenarios";
import { buildSummaryContext } from "@/lib/audit-summary/context";
import { buildFallbackSummary } from "@/lib/audit-summary/fallback";
import { isValidAiSummary } from "@/lib/audit-summary/validate";

describe("audit summary validation", () => {
  it("accepts fallback summary dollar amounts from engine context", () => {
    const audit = runAudit(getDemoScenario("overspending_startup"));
    const fallback = buildFallbackSummary(audit);
    const context = buildSummaryContext(audit);

    expect(isValidAiSummary(fallback.text, context)).toBe(true);
  });

  it("rejects summaries that mention unknown dollar amounts", () => {
    const audit = runAudit(getDemoScenario("overspending_startup"));
    const context = buildSummaryContext(audit);
    const bad =
      "Your team could save $9,999,999 per month by switching plans immediately across all vendors.";

    expect(isValidAiSummary(bad, context)).toBe(false);
  });

  it("rejects empty or too-short text", () => {
    const audit = runAudit(getDemoScenario("optimized_solo"));
    const context = buildSummaryContext(audit);

    expect(isValidAiSummary("", context)).toBe(false);
    expect(isValidAiSummary("Too short.", context)).toBe(false);
  });
});

describe("buildFallbackSummary", () => {
  it("returns deterministic fallback with word count in range", () => {
    const audit = runAudit(getDemoScenario("overspending_startup"));
    const summary = buildFallbackSummary(audit);

    expect(summary.source).toBe("fallback");
    expect(summary.wordCount).toBeGreaterThanOrEqual(60);
    expect(summary.wordCount).toBeLessThanOrEqual(120);
    expect(summary.text.length).toBeGreaterThan(0);
  });
});
