import {
  estimateTierMonthlyCost,
  findIndividualTier,
  getPlanDisplayName,
  getToolPricing,
  isEnterpriseTier,
  isTeamTier,
  isValidPlanTier,
  resolveTier,
  type PricingTier,
  type ToolPricing,
} from "@/data/pricing";
import type { AuditToolEntry, PrimaryUseCase } from "@/types/audit";

export type EvalContext = {
  pricing: ToolPricing;
  entry: AuditToolEntry;
  teamSize: number;
  planKey: string;
  planDisplayName: string;
  currentTier?: PricingTier;
  isValidPlan: boolean;
  seats: number;
  rightSizedSeats: number;
  useCase: PrimaryUseCase;
  currentSpend: number;
  allEntries: AuditToolEntry[];
};

export function buildEvalContext(
  entry: AuditToolEntry,
  teamSize: number,
  allEntries: AuditToolEntry[]
): EvalContext {
  const pricing = getToolPricing(entry.toolId);
  const planKey = entry.planTierId.trim();
  const isValidPlan = isValidPlanTier(entry.toolId, planKey);
  const currentTier = isValidPlan ? resolveTier(pricing, planKey) : undefined;
  const seats = Math.max(entry.seats, 1);
  const rightSizedSeats = Math.min(seats, Math.max(teamSize, 1));

  return {
    pricing,
    entry,
    teamSize,
    planKey,
    planDisplayName: getPlanDisplayName(entry.toolId, planKey),
    currentTier,
    isValidPlan,
    seats,
    rightSizedSeats,
    useCase: entry.primaryUseCase,
    currentSpend: entry.monthlySpend,
    allEntries,
  };
}

export function pickBestTier(
  pricing: ToolPricing,
  seats: number,
  teamSize: number,
  useCase: PrimaryUseCase,
  excludeTierIds: string[] = []
): PricingTier {
  const scoreTier = (tier: PricingTier): number => {
    let score = 0;
    const [minTeam, maxTeam] = tier.bestForTeamSize ?? [1, 999];
    if (teamSize >= minTeam && teamSize <= maxTeam) score += 3;
    if (tier.bestForUseCases?.includes(useCase)) score += 2;
    if (tier.billingModel === "per_seat") {
      const min = tier.minSeats ?? 1;
      if (seats >= min && seats <= teamSize + 2) score += 2;
      if (seats > teamSize + 3) score -= 3;
    }
    if (isEnterpriseTier(tier) && teamSize < 15) score -= 4;
    if (isTeamTier(tier) && teamSize <= 3) score -= 2;
    return score;
  };

  return (
    pricing.tiers
      .filter((t) => !excludeTierIds.includes(t.id))
      .map((tier) => ({ tier, score: scoreTier(tier) }))
      .sort((a, b) => b.score - a.score)[0]?.tier ?? pricing.tiers[0]
  );
}

export function catalogSpendFor(
  ctx: EvalContext,
  tier: PricingTier,
  seats = ctx.rightSizedSeats
): number {
  return estimateTierMonthlyCost(tier, seats);
}

export function findTierByClass(
  pricing: ToolPricing,
  tierClass: PricingTier["tierClass"]
): PricingTier | undefined {
  return pricing.tiers.find((t) => t.tierClass === tierClass);
}

export { findIndividualTier, isEnterpriseTier, isTeamTier };
