import {
  findIndividualTier,
  isEnterpriseTier,
  isTeamTier,
} from "@/data/pricing";
import type {
  AuditToolEntry,
  RecommendationPriority,
  RecommendationType,
} from "@/types/audit";
import type { PricingTier } from "@/data/pricing";

import {
  buildEvalContext,
  catalogSpendFor,
  pickBestTier,
  type EvalContext,
} from "./context";

export type RuleState = {
  recommendedTier: PricingTier;
  recommendedSpend: number;
  recommendationType: RecommendationType;
  reasoning: string;
  actionItems: string[];
  priority: RecommendationPriority;
};

export function createInitialState(ctx: EvalContext): RuleState {
  const tier = pickBestTier(
    ctx.pricing,
    ctx.rightSizedSeats,
    ctx.teamSize,
    ctx.useCase
  );
  return {
    recommendedTier: tier,
    recommendedSpend: catalogSpendFor(ctx, tier),
    recommendationType: "downgrade",
    reasoning: "",
    actionItems: [],
    priority: "medium",
  };
}

function apply(
  state: RuleState,
  patch: Partial<RuleState> & { appendReasoning?: string }
): void {
  if (patch.recommendedTier) state.recommendedTier = patch.recommendedTier;
  if (patch.recommendedSpend !== undefined)
    state.recommendedSpend = patch.recommendedSpend;
  if (patch.recommendationType) state.recommendationType = patch.recommendationType;
  if (patch.priority) state.priority = patch.priority;
  if (patch.reasoning) state.reasoning = patch.reasoning;
  if (patch.appendReasoning) {
    state.reasoning = state.reasoning
      ? `${state.reasoning} ${patch.appendReasoning}`
      : patch.appendReasoning;
  }
  if (patch.actionItems?.length) {
    state.actionItems.push(...patch.actionItems);
  }
}

export function ruleEnterpriseOverprovision(ctx: EvalContext, state: RuleState): void {
  if (!ctx.currentTier || !isEnterpriseTier(ctx.currentTier)) return;
  if (ctx.teamSize >= 25) return;

  const tier = pickBestTier(
    ctx.pricing,
    ctx.rightSizedSeats,
    ctx.teamSize,
    ctx.useCase,
    ["enterprise", "scale"]
  );

  apply(state, {
    recommendedTier: tier,
    recommendedSpend: catalogSpendFor(ctx, tier),
    recommendationType: "downgrade",
    priority: "high",
    reasoning: `${ctx.pricing.displayName} Enterprise is built for procurement, SSO, and compliance at scale. At ${ctx.teamSize} people, ${tier.name} delivers the same day-to-day workflows without enterprise minimums or annual commit friction.`,
    actionItems: [
      "Confirm whether SSO, audit logs, or data residency truly require Enterprise.",
      "Request a mid-cycle seat true-up before renewing annual Enterprise contracts.",
    ],
  });
}

export function ruleSmallTeamOnTeamPlan(ctx: EvalContext, state: RuleState): void {
  if (!ctx.currentTier || !isTeamTier(ctx.currentTier)) return;
  if (ctx.teamSize > 6 || ctx.seats > 4) return;

  const individual = findIndividualTier(ctx.pricing);
  if (!individual) return;

  apply(state, {
    recommendedTier: individual,
    recommendedSpend: catalogSpendFor(ctx, individual),
    recommendationType: "downgrade",
    priority: "high",
    reasoning: `With ${ctx.teamSize} people and ${ctx.seats} billed seat${ctx.seats === 1 ? "" : "s"}, a pooled ${ctx.currentTier.name} plan often bills for empty seats. ${individual.name} licenses tied to active users typically cost less than org-wide team billing.`,
    actionItems: [
      "Audit last-30-day active users before the next true-up.",
      "Disable auto-seat expansion if fewer than half the team uses the tool weekly.",
    ],
  });
}

export function ruleSeatOverprovision(ctx: EvalContext, state: RuleState): void {
  if (ctx.seats <= ctx.teamSize + 1) return;
  if (ctx.pricing.category === "api") return;

  const tier = pickBestTier(
    ctx.pricing,
    ctx.rightSizedSeats,
    ctx.teamSize,
    ctx.useCase
  );

  apply(state, {
    recommendedTier: tier,
    recommendedSpend: catalogSpendFor(ctx, tier),
    recommendationType: "downgrade",
    priority: "high",
    reasoning: `Finance is funding ${ctx.seats} seats for a ${ctx.teamSize}-person team — roughly ${ctx.seats - ctx.teamSize} excess seat${ctx.seats - ctx.teamSize === 1 ? "" : "s"}. Reconcile billed seats to active users on ${tier.name} before the next invoice cycle.`,
    actionItems: [
      `Target ${ctx.rightSizedSeats} active seats in admin console.`,
      "Export seat utilization from vendor admin before renewal conversations.",
    ],
  });
}

export function ruleSpendAboveCatalog(ctx: EvalContext, state: RuleState): void {
  if (ctx.pricing.category === "api") return;
  const benchmark = catalogSpendFor(ctx, state.recommendedTier);
  if (benchmark <= 0 || ctx.currentSpend <= benchmark * 1.25) return;

  apply(state, {
    recommendationType: "downgrade",
    priority: "medium",
    appendReasoning: `Reported spend (${fmt(ctx.currentSpend)}/mo) runs ${Math.round((ctx.currentSpend / benchmark - 1) * 100)}% above list pricing for ${state.recommendedTier.name} at ${ctx.rightSizedSeats} seats — validate legacy tiers, annual prepay amortization, or unused add-ons.`,
    actionItems: ["Compare latest invoice line items against published per-seat rates."],
  });
}

export function ruleIdeBusinessDowngrade(ctx: EvalContext, state: RuleState): void {
  const ideBusinessTools = ["cursor", "windsurf", "v0"] as const;
  if (!ideBusinessTools.includes(ctx.entry.toolId as (typeof ideBusinessTools)[number]))
    return;
  if (!["business", "teams", "team"].includes(ctx.planKey)) return;
  if (ctx.teamSize > 5) return;

  const pro =
    ctx.pricing.tiers.find((t) => t.id === "pro") ??
    ctx.pricing.tiers.find((t) => t.id === "premium");
  if (!pro) return;

  const useCaseLabel = ctx.useCase === "coding" ? "AI-assisted coding" : ctx.useCase.replace("_", " ");

  apply(state, {
    recommendedTier: pro,
    recommendedSpend: catalogSpendFor(ctx, pro),
    recommendationType: "downgrade",
    priority: "high",
    reasoning: `${ctx.pricing.displayName} ${ctx.currentTier?.name ?? "Business"} may be excessive for a ${ctx.teamSize}-person team focused on ${useCaseLabel}. ${pro.name} covers core editor workflows without centralized admin you may not need yet.`,
    actionItems: [
      "Pilot Pro on active developers for 30 days before renewing Business.",
    ],
  });
}

export function ruleCopilotBusiness(ctx: EvalContext, state: RuleState): void {
  if (ctx.entry.toolId !== "github_copilot" || ctx.planKey !== "business") return;
  if (ctx.teamSize > 4) return;

  const ind = findIndividualTier(ctx.pricing);
  if (!ind) return;

  apply(state, {
    recommendedTier: ind,
    recommendedSpend: catalogSpendFor(ctx, ind),
    recommendationType: "downgrade",
    priority: "high",
    reasoning: `Copilot Business is priced for org-wide rollout (typically 4+ engineers with centralized policy). At ${ctx.teamSize} builders, Individual licenses avoid pooled-seat minimums and unused capacity.`,
    actionItems: ["Map GitHub org membership to engineers who commit code weekly."],
  });
}

export function ruleChatAssistantTeamForCoding(ctx: EvalContext, state: RuleState): void {
  if (!["chatgpt", "claude"].includes(ctx.entry.toolId)) return;
  if (ctx.planKey !== "team" || ctx.useCase !== "coding") return;
  if (ctx.teamSize > 5) return;

  const pro = ctx.pricing.tiers.find((t) => ["pro", "plus"].includes(t.id));
  if (!pro) return;

  apply(state, {
    recommendedTier: pro,
    recommendedSpend: catalogSpendFor(ctx, pro),
    recommendationType: "alternative",
    priority: "medium",
    reasoning: `Engineering-led teams your size often keep ${ctx.pricing.displayName} for ad-hoc drafting, not org-wide chat governance. Per-user ${pro.name} for contributors who need it beats maintaining a Team workspace with idle seats.`,
    actionItems: [
      "Survey eng vs. GTM usage — non-engineers may not need Team seats.",
    ],
  });
}

export function ruleClaudeMaxOverkill(ctx: EvalContext, state: RuleState): void {
  if (ctx.entry.toolId !== "claude" || ctx.planKey !== "max") return;
  if (ctx.teamSize > 4 && ctx.seats > 2) return;

  const pro = ctx.pricing.tiers.find((t) => t.id === "pro");
  if (!pro) return;

  apply(state, {
    recommendedTier: pro,
    recommendedSpend: catalogSpendFor(ctx, pro),
    recommendationType: "downgrade",
    priority: "high",
    reasoning: `Claude Max (~$100/user) targets power users with sustained high-volume research. Unless multiple team members hit rate limits on Pro daily, Max is rarely economical for a ${ctx.teamSize}-person org.`,
    actionItems: ["Track Pro rate-limit errors — upgrade only users who hit caps weekly."],
  });
}

export function ruleApiSpend(ctx: EvalContext, state: RuleState): void {
  if (ctx.pricing.category !== "api") return;

  if (ctx.currentSpend === 0) {
    apply(state, {
      recommendationType: "optimized",
      recommendedSpend: 0,
      priority: "low",
      reasoning: `No material ${ctx.pricing.displayName} spend reported — ensure production keys are included if usage is on a shared org account.`,
    });
    return;
  }

  if (ctx.currentSpend < 250) {
    apply(state, {
      recommendationType: "optimized",
      recommendedSpend: ctx.currentSpend,
      priority: "low",
      reasoning: `At ${fmt(ctx.currentSpend)}/mo, pay-as-you-go is appropriate for your scale. Optimize via model routing (smaller models for classification), caching, and dev/prod key separation rather than tier changes.`,
      actionItems: ["Set per-environment spend caps in provider console."],
    });
    return;
  }

  if (isEnterpriseTier(ctx.currentTier) && ctx.teamSize < 15) {
    const tier2 = ctx.pricing.tiers.find((t) => t.id === "tier_2") ?? ctx.pricing.tiers[0];
    const target = Math.round(ctx.currentSpend * 0.78);
    apply(state, {
      recommendedTier: tier2,
      recommendedSpend: target,
      recommendationType: "downgrade",
      priority: "high",
      reasoning: `Scale/committed API tiers make sense with predictable $5k+ monthly burn and finance sign-off. At ${fmt(ctx.currentSpend)}/mo and ${ctx.teamSize} people, usage-tier pricing plus workload batching usually beats locked commits.`,
      actionItems: [
        "Separate sandbox keys from production billing.",
        "Batch non-interactive jobs to off-peak windows.",
      ],
    });
    return;
  }

  if (ctx.currentSpend > 1500 && ctx.teamSize < 20) {
    const target = Math.round(ctx.currentSpend * 0.82);
    apply(state, {
      recommendedSpend: target,
      recommendationType: "credit",
      priority: "medium",
      reasoning: `At ${fmt(ctx.currentSpend)}/mo, committed usage blocks or prepaid inference credits (e.g. via infrastructure marketplaces) can beat sustained list API rates — especially for batch and eval workloads.`,
      actionItems: [
        "Model token mix by endpoint — flag high-cost model defaults in CI.",
        "Evaluate committed spend vs. pay-as-you-go quarterly.",
      ],
    });
    return;
  }

  const utilizationAdjusted = Math.round(
    ctx.currentSpend * Math.min(1, ctx.rightSizedSeats / Math.max(ctx.seats, 1)) * 0.92
  );
  if (utilizationAdjusted < ctx.currentSpend) {
    apply(state, {
      recommendedSpend: utilizationAdjusted,
      recommendationType: "downgrade",
      priority: "medium",
      appendReasoning: "Right-size keys and retire unused service accounts before renegotiating tier.",
    });
  }
}

export function ruleDualApiHint(ctx: EvalContext, state: RuleState): void {
  const apis = ctx.allEntries.filter(
    (e) => e.toolId === "openai_api" || e.toolId === "anthropic_api"
  );
  if (apis.length < 2 || ctx.pricing.category !== "api") return;
  const combined = apis.reduce((s, e) => s + e.monthlySpend, 0);
  if (combined < 800) return;

  apply(state, {
    appendReasoning: `Combined OpenAI + Anthropic API spend is ${fmt(combined)}/mo — consolidating routing (e.g. one gateway, model-based fallbacks) often saves 10–20% without losing capability.`,
    actionItems: ["Inventory which products call which API vendor."],
  });
}

export function ruleCreditOpportunity(ctx: EvalContext, state: RuleState): void {
  if (state.recommendationType === "optimized") return;
  if (!isEnterpriseTier(ctx.currentTier) || ctx.teamSize >= 20) return;

  apply(state, {
    recommendationType: "credit",
    priority: state.priority === "high" ? "high" : "medium",
    appendReasoning:
      "If you must keep enterprise features short-term, prepaid infrastructure credits can lower effective per-seat cost while you migrate tiers.",
  });
}

export function ruleAlreadyEfficient(ctx: EvalContext, state: RuleState): void {
  if (state.reasoning) return;

  const benchmark = catalogSpendFor(ctx, state.recommendedTier);
  const onSameTier =
    ctx.currentTier && ctx.currentTier.id === state.recommendedTier.id;

  if (onSameTier && ctx.currentSpend <= benchmark * 1.15) {
    apply(state, {
      recommendationType: "optimized",
      recommendedSpend: ctx.currentSpend,
      priority: "low",
      reasoning: `${ctx.planDisplayName} aligns with ${ctx.teamSize} people and ${ctx.useCase.replace("_", " ")} usage. Spend is within typical ${ctx.pricing.displayName} benchmarks — no material tier change recommended.`,
    });
    return;
  }

  apply(state, {
    reasoning: `For a ${ctx.teamSize}-person team focused on ${ctx.useCase.replace("_", " ")}, ${state.recommendedTier.name} is a better-fit tier than staying on ${ctx.planDisplayName}.`,
    actionItems: ["Validate admin seat report before changing contracts."],
  });
}

export function runRulePipeline(
  entry: AuditToolEntry,
  teamSize: number,
  allEntries: AuditToolEntry[]
): RuleState {
  const ctx = buildEvalContext(entry, teamSize, allEntries);
  const state = createInitialState(ctx);

  ruleEnterpriseOverprovision(ctx, state);
  ruleSmallTeamOnTeamPlan(ctx, state);
  ruleSeatOverprovision(ctx, state);
  ruleSpendAboveCatalog(ctx, state);
  ruleIdeBusinessDowngrade(ctx, state);
  ruleCopilotBusiness(ctx, state);
  ruleChatAssistantTeamForCoding(ctx, state);
  ruleClaudeMaxOverkill(ctx, state);
  ruleApiSpend(ctx, state);
  ruleDualApiHint(ctx, state);
  ruleCreditOpportunity(ctx, state);
  ruleAlreadyEfficient(ctx, state);

  return state;
}

function fmt(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}
