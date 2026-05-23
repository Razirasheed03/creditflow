import { runAudit } from "@/lib/audit-engine";
import { getDemoScenario } from "@/lib/audit-demo-scenarios";
import type { AuditFormValues } from "@/types/audit";

/** Sample stack for homepage “See Demo” → /results?demo=1 */
export function buildDemoAuditForm(): AuditFormValues {
  return getDemoScenario("overspending_startup");
}

export function buildDemoAuditResult() {
  return runAudit(buildDemoAuditForm());
}
