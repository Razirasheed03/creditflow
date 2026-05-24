import type { AuditResult } from "@/types/audit";
import type { EstimatedSavings } from "@/types/database";

export function buildEstimatedSavings(result: AuditResult): EstimatedSavings {
  return {
    monthly: result.totalMonthlySavings,
    annual: result.totalAnnualSavings,
    rate_percent: result.savingsRatePercent,
  };
}
