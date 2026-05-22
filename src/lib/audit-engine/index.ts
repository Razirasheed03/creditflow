import type { AuditFormValues, AuditResult } from "@/types/audit";

import { evaluateTool } from "./evaluate-tool";

export { evaluateTool } from "./evaluate-tool";

export function runAudit(form: AuditFormValues): AuditResult {
  const teamSize = form.teamSize;
  const recommendations = form.tools.map((entry) =>
    evaluateTool(entry, teamSize)
  );

  const totalCurrentSpend = recommendations.reduce(
    (sum, r) => sum + r.currentSpend,
    0
  );
  const totalRecommendedSpend = recommendations.reduce(
    (sum, r) => sum + r.recommendedSpend,
    0
  );
  const totalMonthlySavings = recommendations.reduce(
    (sum, r) => sum + r.monthlySavings,
    0
  );
  const totalAnnualSavings = totalMonthlySavings * 12;

  const optimizableCount = recommendations.filter(
    (r) => !r.alreadyOptimized && r.monthlySavings > 0
  ).length;

  const isAlreadyOptimized =
    optimizableCount === 0 || totalMonthlySavings < 50;

  let summaryMessage: string;
  if (isAlreadyOptimized) {
    summaryMessage =
      "You're already spending efficiently across the tools you audited. Minor tuning may help, but we don't see material waste.";
  } else if (optimizableCount === 1) {
    summaryMessage = `We found one meaningful optimization opportunity — about $${totalMonthlySavings.toLocaleString()}/mo ($${totalAnnualSavings.toLocaleString()}/yr) in potential savings.`;
  } else {
    summaryMessage = `We identified ${optimizableCount} optimization opportunities totaling ~$${totalMonthlySavings.toLocaleString()}/mo ($${totalAnnualSavings.toLocaleString()}/yr).`;
  }

  return {
    generatedAt: new Date().toISOString(),
    teamSize,
    recommendations,
    totalMonthlySavings,
    totalAnnualSavings,
    totalCurrentSpend,
    totalRecommendedSpend,
    isAlreadyOptimized,
    summaryMessage,
  };
}
