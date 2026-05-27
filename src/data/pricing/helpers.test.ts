import { describe, expect, it } from "vitest";

import { TOOL_CATALOG } from "@/data/pricing/catalog";
import {
  estimateTierMonthlyCost,
  formatCurrency,
  isEnterpriseTier,
  isTeamTier,
  normalizePlanName,
  resolveTier,
} from "@/data/pricing/helpers";
import { isValidPlanTier } from "@/data/pricing/plan-options";

describe("pricing helpers", () => {
  describe("estimateTierMonthlyCost", () => {
    it("returns monthlyBase for flat tiers", () => {
      const tier = TOOL_CATALOG.cursor.tiers.find((t) => t.id === "hobby")!;
      expect(estimateTierMonthlyCost(tier, 10)).toBe(0);
    });

    it("multiplies per-seat price by effective seats with minSeats floor", () => {
      const tier = TOOL_CATALOG.cursor.tiers.find((t) => t.id === "business")!;
      expect(estimateTierMonthlyCost(tier, 1)).toBe(40 * 2);
      expect(estimateTierMonthlyCost(tier, 12)).toBe(40 * 12);
    });

    it("uses midpoint of typicalMonthlyRange for usage tiers", () => {
      const tier = TOOL_CATALOG.anthropic_api.tiers.find(
        (t) => t.id === "pay_as_you_go"
      )!;
      expect(estimateTierMonthlyCost(tier, 1)).toBe(425);
    });
  });

  describe("isValidPlanTier", () => {
    it("accepts catalog tier ids", () => {
      expect(isValidPlanTier("cursor", "pro")).toBe(true);
      expect(isValidPlanTier("chatgpt", "plus")).toBe(true);
    });

    it("rejects unknown tier ids", () => {
      expect(isValidPlanTier("cursor", "sdfsdf")).toBe(false);
    });
  });

  describe("normalizePlanName", () => {
    it("maps aliases to canonical tier ids", () => {
      expect(normalizePlanName("claude", "API Direct")).toBe("api_direct");
      expect(normalizePlanName("github_copilot", "individual")).toBe("individual");
    });
  });

  describe("tier class helpers", () => {
    it("identifies enterprise and team tiers", () => {
      const enterprise = resolveTier(TOOL_CATALOG.cursor, "enterprise")!;
      const business = resolveTier(TOOL_CATALOG.cursor, "business")!;

      expect(isEnterpriseTier(enterprise)).toBe(true);
      expect(isTeamTier(business)).toBe(true);
      expect(isEnterpriseTier(business)).toBe(false);
    });
  });

  describe("formatCurrency", () => {
    it("formats USD without decimals", () => {
      expect(formatCurrency(2400)).toBe("$2,400");
    });
  });
});
