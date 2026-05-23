import { detectStackOverlaps } from "@/data/pricing";
import type { AuditFormValues, AuditResult, ToolRecommendation } from "@/types/audit";

import { evaluateTool } from "./evaluate-tool";
import { sanitizeAuditInput, validateAuditCombinations } from "./sanitize";

export { evaluateTool } from "./evaluate-tool";

const TRUST_NOTE =
  "Estimates use published pricing benchmarks and your inputs. Savings are directional — confirm with invoices and contract terms before making changes.";

export function runAudit(rawForm: AuditFormValues): AuditResult {
  const { form, invalidEntries } = sanitizeAuditInput(rawForm);
  const validationNotes = validateAuditCombinations(form);
  const stackOverlaps = detectStackOverlaps(form.tools).map((o) => ({
    groupId: o.groupId,
    label: o.label,
    toolNames: o.toolNames,
    combinedSpend: o.combinedSpend,
    message: o.message,
  }));

  let recommendations: ToolRecommendation[] = form.tools.map((entry) =>
    evaluateTool(entry, form.teamSize, form.tools)
  );

  recommendations = attachOverlapNotes(recommendations, stackOverlaps);
  recommendations = sortRecommendations(recommendations);

  const totalCurrentSpend = recommendations.reduce(
    (sum, r) => sum + r.currentSpend,
    0
  );
  const totalRecommendedSpend = recommendations.reduce(
    (sum, r) => sum + r.recommendedSpend,
    0
  );
  const totalMonthlySavings = recommendations.reduce(
    (sum, r) => sum + (r.inputInvalid ? 0 : r.monthlySavings),
    0
  );
  const totalAnnualSavings = totalMonthlySavings * 12;
  const optimizableToolCount = recommendations.filter(
    (r) => !r.alreadyOptimized && !r.inputInvalid && r.monthlySavings > 0
  ).length;

  const invalidToolCount =
    invalidEntries.length +
    recommendations.filter((r) => r.inputInvalid).length;

  const savingsRatePercent =
    totalCurrentSpend > 0 ? totalMonthlySavings / totalCurrentSpend : 0;

  const isAlreadyOptimized =
    optimizableToolCount === 0 || totalMonthlySavings < 50;

  const summaryMessage = buildSummaryMessage({
    isAlreadyOptimized,
    optimizableToolCount,
    totalMonthlySavings,
    totalAnnualSavings,
    stackOverlapCount: stackOverlaps.length,
    validationNotes,
  });

  return {
    generatedAt: new Date().toISOString(),
    teamSize: form.teamSize,
    recommendations,
    totalMonthlySavings,
    totalAnnualSavings,
    totalCurrentSpend,
    totalRecommendedSpend,
    savingsRatePercent,
    toolsAudited: recommendations.length,
    optimizableToolCount,
    isAlreadyOptimized,
    summaryMessage,
    stackOverlaps,
    trustNote: TRUST_NOTE,
    inputWarnings: validationNotes,
    invalidToolCount,
  };
}

function attachOverlapNotes(
  recommendations: ToolRecommendation[],
  overlaps: AuditResult["stackOverlaps"]
): ToolRecommendation[] {
  if (overlaps.length === 0) return recommendations;

  return recommendations.map((rec) => {
    const overlap = overlaps.find((o) =>
      o.toolNames.includes(rec.toolName)
    );
    if (!overlap) return rec;

    const overlapNote = overlap.message;
    const hasOverlapType = rec.recommendationType === "overlap";

    return {
      ...rec,
      recommendationType: hasOverlapType ? rec.recommendationType : rec.recommendationType,
      reasoning: rec.reasoning.includes(overlapNote)
        ? rec.reasoning
        : `${rec.reasoning} Stack note: ${overlapNote}`,
      actionItems: [
        ...rec.actionItems,
        "Review redundant tools in this category with finance + eng leads.",
      ],
    };
  });
}

function sortRecommendations(
  recs: ToolRecommendation[]
): ToolRecommendation[] {
  return [...recs].sort((a, b) => {
    if (a.alreadyOptimized !== b.alreadyOptimized) {
      return a.alreadyOptimized ? 1 : -1;
    }
    if (b.monthlySavings !== a.monthlySavings) {
      return b.monthlySavings - a.monthlySavings;
    }
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function buildSummaryMessage(args: {
  isAlreadyOptimized: boolean;
  optimizableToolCount: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  stackOverlapCount: number;
  validationNotes: string[];
}): string {
  const {
    isAlreadyOptimized,
    optimizableToolCount,
    totalMonthlySavings,
    totalAnnualSavings,
    stackOverlapCount,
    validationNotes,
  } = args;

  let base: string;

  if (isAlreadyOptimized) {
    base =
      "You're already spending efficiently across the tools you audited. We don't see material waste from tier or seat misalignment.";
  } else if (optimizableToolCount === 1) {
    base = `We found one high-confidence optimization — about $${totalMonthlySavings.toLocaleString()}/mo ($${totalAnnualSavings.toLocaleString()}/yr) if you act on the recommendation below.`;
  } else {
    base = `We identified ${optimizableToolCount} actionable optimizations totaling ~$${totalMonthlySavings.toLocaleString()}/mo ($${totalAnnualSavings.toLocaleString()}/yr) — prioritized by impact.`;
  }

  if (stackOverlapCount > 0 && !isAlreadyOptimized) {
    base += ` We also flagged ${stackOverlapCount} overlapping tool categor${stackOverlapCount === 1 ? "y" : "ies"} worth consolidating.`;
  }

  if (validationNotes.length > 0) {
    base += ` Note: ${validationNotes[0]}`;
  }

  return base;
}
