import type { PrimaryUseCase, SupportedToolId } from "@/types/audit";

export type BillingModel = "flat" | "per_seat" | "usage";

export type PricingTier = {
  id: string;
  name: string;
  billingModel: BillingModel;
  /** Flat monthly price when billingModel is flat */
  monthlyBase?: number;
  /** Per-seat monthly when billingModel is per_seat */
  pricePerSeat?: number;
  minSeats?: number;
  maxSeats?: number;
  /** Typical monthly spend hint for usage-based tiers */
  typicalMonthlyRange?: [number, number];
  bestForTeamSize?: [number, number];
  bestForUseCases?: PrimaryUseCase[];
  notes?: string;
};

export type ToolPricing = {
  id: SupportedToolId;
  displayName: string;
  category: "ide" | "assistant" | "api";
  tiers: PricingTier[];
  planAliases: Record<string, string>;
};

const alias = (...keys: [string, string][]) =>
  Object.fromEntries(keys) as Record<string, string>;

export const TOOL_PRICING: Record<SupportedToolId, ToolPricing> = {
  cursor: {
    id: "cursor",
    displayName: "Cursor",
    category: "ide",
    planAliases: alias(
      ["pro", "pro"],
      ["business", "business"],
      ["enterprise", "enterprise"],
      ["hobby", "hobby"]
    ),
    tiers: [
      {
        id: "hobby",
        name: "Hobby",
        billingModel: "flat",
        monthlyBase: 0,
        bestForTeamSize: [1, 1],
        bestForUseCases: ["coding"],
      },
      {
        id: "pro",
        name: "Pro",
        billingModel: "per_seat",
        pricePerSeat: 20,
        bestForTeamSize: [1, 8],
        bestForUseCases: ["coding", "mixed"],
        notes: "Individual power users and small eng pods.",
      },
      {
        id: "business",
        name: "Business",
        billingModel: "per_seat",
        pricePerSeat: 40,
        minSeats: 2,
        bestForTeamSize: [8, 50],
        bestForUseCases: ["coding"],
        notes: "Centralized billing and admin controls.",
      },
      {
        id: "enterprise",
        name: "Enterprise",
        billingModel: "per_seat",
        pricePerSeat: 60,
        minSeats: 10,
        bestForTeamSize: [25, 500],
      },
    ],
  },
  github_copilot: {
    id: "github_copilot",
    displayName: "GitHub Copilot",
    category: "ide",
    planAliases: alias(
      ["individual", "individual"],
      ["business", "business"],
      ["enterprise", "enterprise"]
    ),
    tiers: [
      {
        id: "individual",
        name: "Individual",
        billingModel: "per_seat",
        pricePerSeat: 10,
        bestForTeamSize: [1, 3],
        bestForUseCases: ["coding"],
      },
      {
        id: "business",
        name: "Business",
        billingModel: "per_seat",
        pricePerSeat: 19,
        minSeats: 1,
        bestForTeamSize: [4, 100],
        bestForUseCases: ["coding"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        billingModel: "per_seat",
        pricePerSeat: 39,
        minSeats: 50,
        bestForTeamSize: [50, 500],
      },
    ],
  },
  claude: {
    id: "claude",
    displayName: "Claude",
    category: "assistant",
    planAliases: alias(
      ["free", "free"],
      ["pro", "pro"],
      ["team", "team"],
      ["max", "max"],
      ["enterprise", "enterprise"]
    ),
    tiers: [
      {
        id: "pro",
        name: "Pro",
        billingModel: "per_seat",
        pricePerSeat: 20,
        bestForTeamSize: [1, 5],
        bestForUseCases: ["writing", "research", "mixed"],
      },
      {
        id: "team",
        name: "Team",
        billingModel: "per_seat",
        pricePerSeat: 30,
        minSeats: 2,
        bestForTeamSize: [5, 40],
        bestForUseCases: ["writing", "research", "mixed"],
      },
      {
        id: "max",
        name: "Max",
        billingModel: "per_seat",
        pricePerSeat: 100,
        bestForTeamSize: [1, 10],
        bestForUseCases: ["research", "data_analysis"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        billingModel: "per_seat",
        pricePerSeat: 50,
        minSeats: 10,
        bestForTeamSize: [20, 500],
      },
    ],
  },
  chatgpt: {
    id: "chatgpt",
    displayName: "ChatGPT",
    category: "assistant",
    planAliases: alias(
      ["plus", "plus"],
      ["team", "team"],
      ["enterprise", "enterprise"],
      ["free", "free"]
    ),
    tiers: [
      {
        id: "plus",
        name: "Plus",
        billingModel: "per_seat",
        pricePerSeat: 20,
        bestForTeamSize: [1, 5],
        bestForUseCases: ["writing", "mixed", "coding"],
      },
      {
        id: "team",
        name: "Team",
        billingModel: "per_seat",
        pricePerSeat: 30,
        minSeats: 2,
        bestForTeamSize: [5, 50],
        bestForUseCases: ["mixed", "writing", "research"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        billingModel: "per_seat",
        pricePerSeat: 60,
        minSeats: 10,
        bestForTeamSize: [25, 500],
      },
    ],
  },
  anthropic_api: {
    id: "anthropic_api",
    displayName: "Anthropic API",
    category: "api",
    planAliases: alias(
      ["payg", "pay_as_you_go"],
      ["tier1", "tier_1"],
      ["tier2", "tier_2"],
      ["tier3", "tier_3"],
      ["tier4", "tier_4"],
      ["scale", "scale"]
    ),
    tiers: [
      {
        id: "pay_as_you_go",
        name: "Pay-as-you-go",
        billingModel: "usage",
        typicalMonthlyRange: [50, 800],
        bestForTeamSize: [1, 20],
        bestForUseCases: ["coding", "data_analysis"],
      },
      {
        id: "tier_2",
        name: "Usage Tier 2",
        billingModel: "usage",
        typicalMonthlyRange: [500, 2500],
        bestForTeamSize: [5, 50],
      },
      {
        id: "scale",
        name: "Scale / Committed",
        billingModel: "usage",
        typicalMonthlyRange: [2000, 15000],
        bestForTeamSize: [20, 500],
      },
    ],
  },
  openai_api: {
    id: "openai_api",
    displayName: "OpenAI API",
    category: "api",
    planAliases: alias(
      ["payg", "pay_as_you_go"],
      ["tier1", "tier_1"],
      ["tier2", "tier_2"],
      ["tier3", "tier_3"],
      ["scale", "scale"]
    ),
    tiers: [
      {
        id: "pay_as_you_go",
        name: "Pay-as-you-go",
        billingModel: "usage",
        typicalMonthlyRange: [50, 1000],
        bestForTeamSize: [1, 25],
        bestForUseCases: ["coding", "data_analysis", "mixed"],
      },
      {
        id: "tier_2",
        name: "Usage Tier 2",
        billingModel: "usage",
        typicalMonthlyRange: [400, 3000],
        bestForTeamSize: [5, 60],
      },
      {
        id: "scale",
        name: "Scale / Committed",
        billingModel: "usage",
        typicalMonthlyRange: [2500, 20000],
        bestForTeamSize: [15, 500],
      },
    ],
  },
  gemini: {
    id: "gemini",
    displayName: "Gemini",
    category: "assistant",
    planAliases: alias(
      ["free", "free"],
      ["advanced", "advanced"],
      ["business", "business"],
      ["enterprise", "enterprise"]
    ),
    tiers: [
      {
        id: "advanced",
        name: "Advanced",
        billingModel: "per_seat",
        pricePerSeat: 20,
        bestForTeamSize: [1, 5],
        bestForUseCases: ["research", "mixed", "writing"],
      },
      {
        id: "business",
        name: "Business",
        billingModel: "per_seat",
        pricePerSeat: 30,
        minSeats: 2,
        bestForTeamSize: [5, 80],
        bestForUseCases: ["mixed", "research"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        billingModel: "per_seat",
        pricePerSeat: 50,
        minSeats: 10,
        bestForTeamSize: [20, 500],
      },
    ],
  },
  windsurf: {
    id: "windsurf",
    displayName: "Windsurf",
    category: "ide",
    planAliases: alias(
      ["free", "free"],
      ["pro", "pro"],
      ["teams", "teams"],
      ["enterprise", "enterprise"]
    ),
    tiers: [
      {
        id: "pro",
        name: "Pro",
        billingModel: "per_seat",
        pricePerSeat: 15,
        bestForTeamSize: [1, 6],
        bestForUseCases: ["coding"],
      },
      {
        id: "teams",
        name: "Teams",
        billingModel: "per_seat",
        pricePerSeat: 30,
        minSeats: 2,
        bestForTeamSize: [4, 40],
        bestForUseCases: ["coding"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        billingModel: "per_seat",
        pricePerSeat: 45,
        minSeats: 10,
        bestForTeamSize: [20, 500],
      },
    ],
  },
  v0: {
    id: "v0",
    displayName: "v0",
    category: "ide",
    planAliases: alias(
      ["free", "free"],
      ["premium", "premium"],
      ["team", "team"],
      ["enterprise", "enterprise"]
    ),
    tiers: [
      {
        id: "premium",
        name: "Premium",
        billingModel: "per_seat",
        pricePerSeat: 20,
        bestForTeamSize: [1, 5],
        bestForUseCases: ["coding", "mixed"],
      },
      {
        id: "team",
        name: "Team",
        billingModel: "per_seat",
        pricePerSeat: 30,
        minSeats: 2,
        bestForTeamSize: [3, 30],
        bestForUseCases: ["coding"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        billingModel: "per_seat",
        pricePerSeat: 50,
        minSeats: 10,
        bestForTeamSize: [15, 500],
      },
    ],
  },
};

export const SUPPORTED_TOOLS_LIST = Object.values(TOOL_PRICING);

export function getToolPricing(toolId: SupportedToolId): ToolPricing {
  return TOOL_PRICING[toolId];
}

export function normalizePlanName(
  toolId: SupportedToolId,
  rawPlan: string
): string {
  const key = rawPlan.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
  const pricing = TOOL_PRICING[toolId];
  return pricing.planAliases[key] ?? key;
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
