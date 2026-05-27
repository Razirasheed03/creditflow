import { describe, expect, it } from "vitest";

import { getDemoScenario } from "@/lib/audit-demo-scenarios";
import { runAudit } from "@/lib/audit-engine";
import { sanitizeAuditInput } from "@/lib/audit-engine/sanitize";
import type { AuditFormValues } from "@/types/audit";

describe("runAudit", () => {
  it("returns structured totals for the overspending startup demo", () => {
    const form = getDemoScenario("overspending_startup");
    const result = runAudit(form);

    expect(result.teamSize).toBe(12);
    expect(result.recommendations).toHaveLength(4);
    expect(result.totalCurrentSpend).toBeGreaterThan(0);
    expect(result.toolsAudited).toBe(4);
    expect(result.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(result.trustNote).toContain("published pricing benchmarks");
  });

  it("flags material savings for overspending startup", () => {
    const result = runAudit(getDemoScenario("overspending_startup"));

    expect(result.isAlreadyOptimized).toBe(false);
    expect(result.optimizableToolCount).toBeGreaterThan(0);
    expect(result.totalMonthlySavings).toBeGreaterThanOrEqual(25);
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
  });

  it("treats optimized solo founder as already efficient", () => {
    const result = runAudit(getDemoScenario("optimized_solo"));

    expect(result.teamSize).toBe(1);
    expect(result.isAlreadyOptimized).toBe(true);
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.optimizableToolCount).toBe(0);
  });

  it("detects stack overlaps when combined IDE/chat spend is high", () => {
    const result = runAudit(getDemoScenario("overspending_startup"));

    expect(result.stackOverlaps.length).toBeGreaterThan(0);
    const ideOverlap = result.stackOverlaps.find((o) => o.groupId === "ide_coding");
    expect(ideOverlap).toBeDefined();
    expect(ideOverlap!.toolNames.length).toBeGreaterThanOrEqual(2);
  });

  it("never claims savings on invalid plan entries", () => {
    const form: AuditFormValues = {
      teamSize: 5,
      tools: [
        {
          id: "bad-1",
          toolId: "cursor",
          planTierId: "not_a_real_plan",
          monthlySpend: 500,
          seats: 5,
          primaryUseCase: "coding",
        },
      ],
    };

    const { form: sanitized, invalidEntries } = sanitizeAuditInput(form);
    expect(invalidEntries).toHaveLength(1);

    const result = runAudit(sanitized);
    const rec = result.recommendations[0];

    expect(rec.inputInvalid).toBe(true);
    expect(rec.monthlySavings).toBe(0);
    expect(rec.annualSavings).toBe(0);
    expect(result.invalidToolCount).toBeGreaterThanOrEqual(1);
  });

  it("caps recommended spend at reported current spend", () => {
    const result = runAudit(getDemoScenario("overspending_startup"));

    for (const rec of result.recommendations) {
      if (!rec.inputInvalid) {
        expect(rec.recommendedSpend).toBeLessThanOrEqual(rec.currentSpend);
      }
    }
  });

  it("sorts recommendations with highest savings first among optimizable tools", () => {
    const result = runAudit(getDemoScenario("overspending_startup"));
    const actionable = result.recommendations.filter(
      (r) => !r.alreadyOptimized && !r.inputInvalid && r.monthlySavings > 0
    );

    if (actionable.length >= 2) {
      expect(actionable[0].monthlySavings).toBeGreaterThanOrEqual(
        actionable[1].monthlySavings
      );
    }
  });
});
