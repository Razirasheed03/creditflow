import { describe, expect, it } from "vitest";

import { detectStackOverlaps } from "@/data/pricing/overlap";
import type { AuditToolEntry } from "@/types/audit";

function entry(
  partial: Pick<AuditToolEntry, "toolId" | "monthlySpend"> &
    Partial<AuditToolEntry>
): AuditToolEntry {
  return {
    id: partial.id ?? "test-id",
    toolId: partial.toolId,
    planTierId: partial.planTierId ?? "pro",
    monthlySpend: partial.monthlySpend,
    seats: partial.seats ?? 1,
    primaryUseCase: partial.primaryUseCase ?? "coding",
  };
}

describe("detectStackOverlaps", () => {
  it("returns empty when only one tool in a group", () => {
    const overlaps = detectStackOverlaps([
      entry({ toolId: "cursor", monthlySpend: 200 }),
    ]);
    expect(overlaps).toHaveLength(0);
  });

  it("flags IDE overlap when combined spend meets threshold", () => {
    const overlaps = detectStackOverlaps([
      entry({ toolId: "cursor", monthlySpend: 50 }),
      entry({ toolId: "github_copilot", monthlySpend: 50 }),
    ]);

    expect(overlaps).toHaveLength(1);
    expect(overlaps[0].groupId).toBe("ide_coding");
    expect(overlaps[0].combinedSpend).toBe(100);
  });

  it("skips overlap when combined spend is below minCombinedSpend", () => {
    const overlaps = detectStackOverlaps([
      entry({ toolId: "cursor", monthlySpend: 20 }),
      entry({ toolId: "github_copilot", monthlySpend: 20 }),
    ]);

    expect(overlaps).toHaveLength(0);
  });

  it("flags dual LLM APIs when combined spend is at least $500", () => {
    const overlaps = detectStackOverlaps([
      entry({ toolId: "openai_api", monthlySpend: 300 }),
      entry({ toolId: "anthropic_api", monthlySpend: 250 }),
    ]);

    expect(overlaps.some((o) => o.groupId === "llm_apis")).toBe(true);
  });
});
