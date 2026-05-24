import { runAudit } from "@/lib/audit-engine";
import { getDemoScenario } from "@/lib/audit-demo-scenarios";
import type { AuditFormSchema } from "@/lib/audit-schema";

/** Sample stack for homepage “See Demo” → /results?demo=1 */
export function buildDemoAuditForm(): AuditFormSchema {
  return getDemoScenario("overspending_startup");
}

export function buildDemoAuditResult() {
  return runAudit(buildDemoAuditForm());
}
