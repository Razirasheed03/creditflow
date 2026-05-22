import {
  estimateTierMonthlyCost,
  getToolPricing,
  normalizePlanName,
  type PricingTier,
  type ToolPricing,
} from "@/data/pricing";
import type {
  AuditToolEntry,
  PrimaryUseCase,
  RecommendationType,
  ToolRecommendation,
} from "@/types/audit";

const OPTIMIZED_SAVINGS_THRESHOLD = 25;
const OPTIMIZED_SAVINGS_PERCENT = 0.05;

type Evaluation = {
  recommendedTier: PricingTier;
  recommendedPlan: string;
  recommendedSpend: number;
  monthlySavings: number;
  recommendationType: RecommendationType;
  reasoning: string;
  alreadyOptimized: boolean;
};

function resolveTier(pricing: ToolPricing, planKey: string): PricingTier | undefined {
  return pricing.tiers.find((t) => t.id === planKey);
}

function tierScore(
  tier: PricingTier,
  seats: number,
  teamSize: number,
  useCase: PrimaryUseCase
): number {
  let score = 0;
  const [minTeam, maxTeam] = tier.bestForTeamSize ?? [1, 999];
  if (teamSize >= minTeam && teamSize <= maxTeam) score += 3;
  if (tier.bestForUseCases?.includes(useCase)) score += 2;
  if (tier.billingModel === "per_seat") {
    const min = tier.minSeats ?? 1;
    if (seats >= min && seats <= teamSize + 2) score += 2;
    if (seats > teamSize + 3) score -= 2;
  }
  return score;
}

function pickBestTier(
  pricing: ToolPricing,
  seats: number,
  teamSize: number,
  useCase: PrimaryUseCase,
  excludeTierIds: string[] = []
): PricingTier {
  const candidates = pricing.tiers
    .filter((t) => !excludeTierIds.includes(t.id))
    .map((tier) => ({ tier, score: tierScore(tier, seats, teamSize, useCase) }))
    .sort((a, b) => b.score - a.score);

  return candidates[0]?.tier ?? pricing.tiers[0];
}

function isEnterpriseLike(tierId: string): boolean {
  return ["enterprise", "scale", "tier_4"].includes(tierId);
}

function isTeamLike(tierId: string): boolean {
  return ["team", "teams", "business"].includes(tierId);
}

function evaluateIdeAssistant(
  pricing: ToolPricing,
  entry: AuditToolEntry,
  teamSize: number
): Evaluation {
  const planKey = normalizePlanName(entry.toolId, entry.currentPlan);
  const currentTier = resolveTier(pricing, planKey);
  const seats = Math.max(entry.seats, 1);
  const useCase = entry.primaryUseCase;
  const currentSpend = entry.monthlySpend;

  let recommendedTier = pickBestTier(pricing, seats, teamSize, useCase);
  let recommendationType: RecommendationType = "downgrade";
  let reasoning = "";

  const catalogSpend = estimateTierMonthlyCost(
    recommendedTier,
    Math.min(seats, teamSize)
  );
  const rightSizedSeats = Math.min(seats, Math.max(teamSize, 1));

  if (currentTier && isEnterpriseLike(currentTier.id) && teamSize < 20) {
    recommendedTier =
      pickBestTier(pricing, rightSizedSeats, teamSize, useCase, [
        "enterprise",
        "scale",
      ]) ?? recommendedTier;
    recommendationType = "downgrade";
    reasoning = `${pricing.displayName} Enterprise is typically reserved for larger orgs with procurement and security reviews. A team of ${teamSize} rarely needs enterprise admin overhead — ${recommendedTier.name} covers the same workflows at lower committed spend.`;
  } else if (
    currentTier &&
    isTeamLike(currentTier.id) &&
    teamSize <= 5 &&
    seats <= 3
  ) {
    const individualTier = pricing.tiers.find(
      (t) =>
        ["pro", "plus", "individual", "premium", "advanced"].includes(t.id) &&
        t.billingModel === "per_seat"
    );
    if (individualTier) {
      recommendedTier = individualTier;
      recommendationType = "downgrade";
      reasoning = `With ${teamSize} people and only ${seats} billed seat${seats === 1 ? "" : "s"}, a pooled Team/Business plan often leaves seats unused. ${individualTier.name} per active builder is usually cheaper than carrying org-wide team billing.`;
    }
  } else if (seats > teamSize + 1) {
    recommendedTier = pickBestTier(
      pricing,
      rightSizedSeats,
      teamSize,
      useCase
    );
    recommendationType = "downgrade";
    reasoning = `You're paying for ${seats} seats but reported a team of ${teamSize}. Right-sizing to ${rightSizedSeats} active seat${rightSizedSeats === 1 ? "" : "s"} on ${recommendedTier.name} aligns cost with actual headcount.`;
  } else if (
    currentTier?.billingModel === "per_seat" &&
    catalogSpend > 0 &&
    currentSpend > catalogSpend * 1.35
  ) {
    recommendationType = "downgrade";
    reasoning = `Your ${entry.currentPlan} spend ($${currentSpend}/mo) is well above catalog pricing for ${recommendedTier.name} (~$${catalogSpend}/mo at ${rightSizedSeats} seats). Confirm you're not on a legacy tier or over-provisioned seat count.`;
  } else {
    const alt = pricing.tiers.find((t) => t.id === recommendedTier.id);
    if (alt && currentTier && alt.id === currentTier.id) {
      recommendationType = "optimized";
      reasoning = `Your ${entry.currentPlan} tier matches team size and ${useCase.replace("_", " ")} usage patterns. Spend is in line with typical ${pricing.displayName} pricing.`;
    } else {
      reasoning = `For ${teamSize} people focused on ${useCase.replace("_", " ")}, ${recommendedTier.name} is the better-fit tier versus staying on ${entry.currentPlan}.`;
    }
  }

  if (
    recommendationType !== "optimized" &&
    isEnterpriseLike(planKey) &&
    teamSize < 15
  ) {
    recommendationType = "credit";
    reasoning += ` Prepaid infrastructure credits (via partners like Credex) can further reduce effective per-seat cost if you must keep enterprise features short-term.`;
  }

  let recommendedSpend = estimateTierMonthlyCost(recommendedTier, rightSizedSeats);

  if (pricing.category === "api") {
    recommendedSpend = Math.min(
      currentSpend,
      Math.round(currentSpend * (rightSizedSeats / Math.max(seats, 1)) * 0.85)
    );
    if (currentSpend > 2000 && teamSize < 15) {
      recommendationType = "credit";
      reasoning = `At $${currentSpend}/mo on ${pricing.displayName}, committed usage tiers or prepaid credits often beat list API rates. Batch non-latency workloads and cap dev sandbox keys before moving to scale tiers.`;
      recommendedSpend = Math.round(currentSpend * 0.72);
    } else if (currentSpend < 300) {
      recommendationType = "optimized";
      reasoning = `Your API spend is modest for team size — pay-as-you-go is likely appropriate. Focus on key rotation and model routing rather than tier changes.`;
      recommendedSpend = currentSpend;
    }
  }

  if (useCase === "coding" && ["chatgpt", "claude"].includes(entry.toolId)) {
    const teamTier = pricing.tiers.find((t) => t.id === "team");
    if (
      teamTier &&
      planKey === "team" &&
      teamSize <= 4 &&
      entry.primaryUseCase === "coding"
    ) {
      const proTier = pricing.tiers.find((t) =>
        ["pro", "plus"].includes(t.id)
      );
      if (proTier) {
        recommendedTier = proTier;
        recommendedSpend = estimateTierMonthlyCost(proTier, rightSizedSeats);
        recommendationType = "alternative";
        reasoning = `Engineering-heavy ${teamSize}-person teams often use ${pricing.displayName} for ad-hoc writing, not org-wide chat. Per-seat ${proTier.name} for active users beats a Team workspace you may not fully utilize.`;
      }
    }
  }

  if (entry.toolId === "github_copilot" && planKey === "business" && teamSize <= 3) {
    const ind = pricing.tiers.find((t) => t.id === "individual");
    if (ind) {
      recommendedTier = ind;
      recommendedSpend = estimateTierMonthlyCost(ind, rightSizedSeats);
      recommendationType = "downgrade";
      reasoning = `Copilot Business shines at 4+ engineers on GitHub Enterprise patterns. For ${teamSize} builders, Individual licenses avoid unused pooled seats.`;
    }
  }

  if (entry.toolId === "cursor" && planKey === "business" && teamSize <= 4) {
    const pro = pricing.tiers.find((t) => t.id === "pro");
    if (pro) {
      recommendedTier = pro;
      recommendedSpend = estimateTierMonthlyCost(pro, rightSizedSeats);
      recommendationType = "downgrade";
      reasoning = `Cursor Business may be unnecessary for a ${teamSize}-person engineering team primarily using lightweight AI-assisted coding workflows. Pro covers the same editor features without org admin overhead.`;
    }
  }

  recommendedSpend = Math.min(recommendedSpend, currentSpend);
  const monthlySavings = Math.max(0, currentSpend - recommendedSpend);

  const alreadyOptimized =
    monthlySavings < OPTIMIZED_SAVINGS_THRESHOLD &&
    monthlySavings / Math.max(currentSpend, 1) < OPTIMIZED_SAVINGS_PERCENT;

  if (alreadyOptimized) {
    recommendationType = "optimized";
    recommendedSpend = currentSpend;
    reasoning = `Your ${pricing.displayName} setup is already well-matched to a ${teamSize}-person team. We don't recommend changes that would save less than $${OPTIMIZED_SAVINGS_THRESHOLD}/mo.`;
  }

  return {
    recommendedTier,
    recommendedPlan: recommendedTier.name,
    recommendedSpend: alreadyOptimized ? currentSpend : recommendedSpend,
    monthlySavings: alreadyOptimized ? 0 : monthlySavings,
    recommendationType: alreadyOptimized ? "optimized" : recommendationType,
    reasoning,
    alreadyOptimized,
  };
}

export function evaluateTool(
  entry: AuditToolEntry,
  teamSize: number
): ToolRecommendation {
  const pricing = getToolPricing(entry.toolId);
  const evaluation = evaluateIdeAssistant(pricing, entry, teamSize);

  return {
    toolId: entry.toolId,
    toolName: pricing.displayName,
    currentPlan: entry.currentPlan,
    currentSpend: entry.monthlySpend,
    seats: entry.seats,
    primaryUseCase: entry.primaryUseCase,
    recommendedPlan: evaluation.recommendedPlan,
    recommendedSpend: evaluation.recommendedSpend,
    monthlySavings: evaluation.monthlySavings,
    annualSavings: evaluation.monthlySavings * 12,
    recommendationType: evaluation.recommendationType,
    reasoning: evaluation.reasoning,
    alreadyOptimized: evaluation.alreadyOptimized,
  };
}
