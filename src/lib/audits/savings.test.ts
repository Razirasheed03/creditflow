import { describe, expect, it } from "vitest";

import { runAudit } from "@/lib/audit-engine";
import { getDemoScenario } from "@/lib/audit-demo-scenarios";
import { buildEstimatedSavings } from "@/lib/audits/savings";

describe("buildEstimatedSavings", () => {
  it("maps audit result totals to persisted savings shape", () => {
    const result = runAudit(getDemoScenario("overspending_startup"));
    const savings = buildEstimatedSavings(result);

    expect(savings.monthly).toBe(result.totalMonthlySavings);
    expect(savings.annual).toBe(result.totalAnnualSavings);
    expect(savings.rate_percent).toBe(result.savingsRatePercent);
  });
});
