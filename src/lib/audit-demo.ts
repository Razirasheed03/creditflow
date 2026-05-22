import { runAudit } from "@/lib/audit-engine";
import type { AuditFormValues } from "@/types/audit";

/** Sample stack for homepage “See Demo” → /results?demo=1 */
export function buildDemoAuditForm(): AuditFormValues {
  return {
    teamSize: 12,
    tools: [
      {
        id: "demo-1",
        toolId: "chatgpt",
        currentPlan: "Team",
        monthlySpend: 2400,
        seats: 18,
        primaryUseCase: "mixed",
      },
      {
        id: "demo-2",
        toolId: "cursor",
        currentPlan: "Business",
        monthlySpend: 960,
        seats: 24,
        primaryUseCase: "coding",
      },
      {
        id: "demo-3",
        toolId: "anthropic_api",
        currentPlan: "Scale",
        monthlySpend: 3200,
        seats: 1,
        primaryUseCase: "data_analysis",
      },
    ],
  };
}

export function buildDemoAuditResult() {
  return runAudit(buildDemoAuditForm());
}
