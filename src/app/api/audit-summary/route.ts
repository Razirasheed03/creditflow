import { NextResponse } from "next/server";
import { z } from "zod";

import { buildFallbackSummary } from "@/lib/audit-summary/fallback";
import { generateAuditSummary } from "@/lib/audit-summary/generate";
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

const auditResultSchema = z.object({
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

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = auditResultSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid audit payload" }, { status: 400 });
  }

  try {
    const summary = await generateAuditSummary(parsed.data);
    return NextResponse.json(summary);
  } catch {
    return NextResponse.json(buildFallbackSummary(parsed.data));
  }
}
