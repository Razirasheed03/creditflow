import type { SupportedToolId } from "@/types/audit";

import { TOOL_CATALOG } from "./catalog";
import { normalizePlanName, resolveTier } from "./helpers";

export type PlanOption = {
  value: string;
  label: string;
};

export function getPlanOptionsForTool(toolId: SupportedToolId): PlanOption[] {
  return TOOL_CATALOG[toolId].tiers.map((tier) => ({
    value: tier.id,
    label: tier.name,
  }));
}

export function getDefaultPlanTierId(toolId: SupportedToolId): string {
  const tiers = TOOL_CATALOG[toolId].tiers;
  const preferred =
    tiers.find((t) => t.id === "pro") ??
    tiers.find((t) => t.id === "plus") ??
    tiers.find((t) => t.id === "individual") ??
    tiers.find((t) => t.tierClass === "individual") ??
    tiers[0];
  return preferred?.id ?? tiers[0]?.id ?? "";
}

export function isValidPlanTier(
  toolId: SupportedToolId,
  planTierId: string
): boolean {
  if (!planTierId?.trim()) return false;
  return Boolean(resolveTier(TOOL_CATALOG[toolId], planTierId.trim()));
}

export function getPlanDisplayName(
  toolId: SupportedToolId,
  planTierId: string
): string {
  const tier = resolveTier(TOOL_CATALOG[toolId], planTierId);
  return tier?.name ?? planTierId;
}

/** Map legacy free-text plan labels from older drafts to catalog tier ids. */
export function resolvePlanTierIdFromLegacy(
  toolId: SupportedToolId,
  rawPlan: string
): string | null {
  const key = normalizePlanName(toolId, rawPlan);
  if (key === "unknown") return null;
  return isValidPlanTier(toolId, key) ? key : null;
}
