import { isValidPlanTier } from "@/data/pricing";
import type { AuditFormValues, AuditToolEntry } from "@/types/audit";

const MAX_MONTHLY_SPEND = 500_000;
const MAX_SEATS = 10_000;

export type SanitizedAuditInput = {
  form: AuditFormValues;
  invalidEntries: AuditToolEntry[];
};

export function sanitizeAuditInput(form: AuditFormValues): SanitizedAuditInput {
  const teamSize = Math.max(1, Math.min(Math.floor(form.teamSize) || 1, 500));

  const tools = form.tools.map(sanitizeToolEntry);
  const invalidEntries = tools.filter(
    (t) => !isValidPlanTier(t.toolId, t.planTierId)
  );

  return {
    form: {
      teamSize,
      tools: tools.length > 0 ? tools : [sanitizeToolEntry(form.tools[0])],
    },
    invalidEntries,
  };
}

function sanitizeToolEntry(entry: AuditToolEntry): AuditToolEntry {
  return {
    ...entry,
    planTierId: entry.planTierId?.trim() ?? "",
    monthlySpend: clampNumber(entry.monthlySpend, 0, MAX_MONTHLY_SPEND),
    seats: clampNumber(entry.seats, 1, MAX_SEATS),
  };
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function validateAuditCombinations(
  form: AuditFormValues
): string[] {
  const warnings: string[] = [];

  if (form.teamSize === 1 && form.tools.some((t) => t.seats > 5)) {
    warnings.push(
      "Seat count exceeds team size for a solo operator — verify billed seats vs. active users."
    );
  }

  const invalidPlans = form.tools.filter(
    (t) => !isValidPlanTier(t.toolId, t.planTierId)
  );
  if (invalidPlans.length > 0) {
    warnings.push(
      `${invalidPlans.length} tool(s) have invalid plan selections — those lines are excluded from savings estimates.`
    );
  }

  return warnings;
}
