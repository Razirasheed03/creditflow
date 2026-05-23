import type { PrimaryUseCase, SupportedToolId } from "@/types/audit";

export type BillingModel = "flat" | "per_seat" | "usage";

export type ToolCategory = "ide" | "assistant" | "api";

export type TierClass = "individual" | "team" | "enterprise" | "usage" | "free";

export type PricingTier = {
  id: string;
  name: string;
  billingModel: BillingModel;
  tierClass: TierClass;
  monthlyBase?: number;
  pricePerSeat?: number;
  minSeats?: number;
  maxSeats?: number;
  typicalMonthlyRange?: [number, number];
  bestForTeamSize?: [number, number];
  bestForUseCases?: PrimaryUseCase[];
  notes?: string;
};

export type ToolAlternative = {
  name: string;
  condition: string;
  monthlyHint?: string;
};

export type ToolPricing = {
  id: SupportedToolId;
  displayName: string;
  category: ToolCategory;
  tiers: PricingTier[];
  planAliases: Record<string, string>;
  alternatives?: ToolAlternative[];
};

export type OverlapGroup = {
  id: string;
  label: string;
  toolIds: SupportedToolId[];
  /** Minimum combined monthly spend to surface overlap */
  minCombinedSpend?: number;
  message: string;
};
