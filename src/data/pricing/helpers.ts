import type { SupportedToolId } from "@/types/audit";

import { TOOL_CATALOG } from "./catalog";
import type { PricingTier, ToolPricing } from "./types";

export const SUPPORTED_TOOLS_LIST = Object.values(TOOL_CATALOG);

export function getToolPricing(toolId: SupportedToolId): ToolPricing {
  return TOOL_CATALOG[toolId];
}

export function normalizePlanName(
  toolId: SupportedToolId,
  rawPlan: string
): string {
  const key = rawPlan.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
  if (!key) return "unknown";
  const pricing = TOOL_CATALOG[toolId];
  return pricing.planAliases[key] ?? key;
}

export function resolveTier(
  pricing: ToolPricing,
  planKey: string
): PricingTier | undefined {
  return pricing.tiers.find((t) => t.id === planKey);
}

export function estimateTierMonthlyCost(
  tier: PricingTier,
  seats: number
): number {
  if (tier.billingModel === "flat") {
    return tier.monthlyBase ?? 0;
  }
  if (tier.billingModel === "per_seat") {
    const effectiveSeats = Math.max(seats, tier.minSeats ?? 1);
    return (tier.pricePerSeat ?? 0) * effectiveSeats;
  }
  if (tier.typicalMonthlyRange) {
    const [low, high] = tier.typicalMonthlyRange;
    return Math.round((low + high) / 2);
  }
  return 0;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function isEnterpriseTier(tier?: PricingTier): boolean {
  return tier?.tierClass === "enterprise" || tier?.id === "scale";
}

export function isTeamTier(tier?: PricingTier): boolean {
  return (
    tier?.tierClass === "team" ||
    ["team", "teams", "business"].includes(tier?.id ?? "")
  );
}

export function findIndividualTier(pricing: ToolPricing): PricingTier | undefined {
  return pricing.tiers.find(
    (t) =>
      t.tierClass === "individual" ||
      ["pro", "plus", "individual", "premium", "advanced"].includes(t.id)
  );
}
