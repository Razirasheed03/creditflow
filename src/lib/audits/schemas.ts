import { z } from "zod";

import { auditFormSchema } from "@/lib/audit-schema";
import { PRIMARY_USE_CASES, SUPPORTED_TOOL_IDS } from "@/types/audit";

const toolRecommendationSchema = z.object({
  toolId: z.enum(SUPPORTED_TOOL_IDS),
  toolName: z.string(),
  currentPlan: z.string(),
  currentSpend: z.number(),
  seats: z.number(),
  primaryUseCase: z.enum(PRIMARY_USE_CASES),
  recommendedPlan: z.string(),
  recommendedSpend: z.number(),
  monthlySavings: z.number(),
  annualSavings: z.number(),
  savingsPercent: z.number(),
  recommendationType: z.enum([
    "downgrade",
    "alternative",
    "credit",
    "optimized",
    "overlap",
  ]),
  priority: z.enum(["high", "medium", "low"]),
  reasoning: z.string(),
  actionItems: z.array(z.string()),
  alreadyOptimized: z.boolean(),
  catalogBenchmark: z.number().optional(),
  inputInvalid: z.boolean().optional(),
});

export const auditResultSchema = z.object({
  generatedAt: z.string(),
  teamSize: z.number(),
  recommendations: z.array(toolRecommendationSchema).min(1),
  totalMonthlySavings: z.number(),
  totalAnnualSavings: z.number(),
  totalCurrentSpend: z.number(),
  totalRecommendedSpend: z.number(),
  savingsRatePercent: z.number(),
  toolsAudited: z.number(),
  optimizableToolCount: z.number(),
  isAlreadyOptimized: z.boolean(),
  summaryMessage: z.string(),
  stackOverlaps: z.array(
    z.object({
      groupId: z.string(),
      label: z.string(),
      toolNames: z.array(z.string()),
      combinedSpend: z.number(),
      message: z.string(),
    })
  ),
  trustNote: z.string(),
  inputWarnings: z.array(z.string()),
  invalidToolCount: z.number(),
});

export const createAuditSchema = z.object({
  auditData: auditFormSchema,
  resultData: auditResultSchema,
  website: z.string().optional(),
});

export const leadCaptureSchema = z.object({
  shareId: z.string().min(8).max(64),
  email: z.string().email().max(254),
  companyName: z.string().max(120).optional(),
  role: z.string().max(80).optional(),
  website: z.string().optional(),
});

export type CreateAuditInput = z.infer<typeof createAuditSchema>;
export type LeadCaptureInput = z.infer<typeof leadCaptureSchema>;
