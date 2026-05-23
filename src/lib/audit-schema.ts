import { z } from "zod";

import {
  getDefaultPlanTierId,
  isValidPlanTier,
  resolvePlanTierIdFromLegacy,
} from "@/data/pricing";
import { PRIMARY_USE_CASES, SUPPORTED_TOOL_IDS } from "@/types/audit";
import type { AuditFormValues, AuditToolEntry, SupportedToolId } from "@/types/audit";

export const auditToolEntrySchema = z
  .object({
    id: z.string().min(1),
    toolId: z.enum(SUPPORTED_TOOL_IDS, {
      message: "Select a tool",
    }),
    planTierId: z.string().min(1, "Select your current plan"),
    monthlySpend: z
      .number({ message: "Enter monthly spend" })
      .positive("Monthly spend must be greater than $0"),
    seats: z
      .number({ message: "Enter seat count" })
      .int("Seats must be a whole number")
      .positive("Seats must be at least 1"),
    primaryUseCase: z.enum(PRIMARY_USE_CASES, {
      message: "Select a primary use case",
    }),
  })
  .superRefine((entry, ctx) => {
    if (!isValidPlanTier(entry.toolId, entry.planTierId)) {
      ctx.addIssue({
        code: "custom",
        path: ["planTierId"],
        message: "Selected plan is not valid for this tool",
      });
    }
  });

export const auditFormSchema = z.object({
  teamSize: z
    .number({ message: "Enter team size" })
    .int("Team size must be a whole number")
    .positive("Team size must be at least 1"),
  tools: z.array(auditToolEntrySchema).min(1, "Add at least one tool"),
});

export type AuditFormSchema = z.infer<typeof auditFormSchema>;

export const defaultToolEntry = (
  toolId: SupportedToolId = "cursor"
): AuditToolEntry => ({
  id: crypto.randomUUID(),
  toolId,
  planTierId: getDefaultPlanTierId(toolId),
  monthlySpend: 0,
  seats: 1,
  primaryUseCase: "coding",
});

export const defaultAuditFormValues = (): AuditFormSchema => ({
  teamSize: 5,
  tools: [defaultToolEntry()],
});

type LegacyToolEntry = AuditToolEntry & { currentPlan?: string };

export function migrateAuditFormValues(
  raw: Partial<AuditFormValues> | null
): AuditFormSchema | null {
  if (!raw?.tools?.length) return null;

  const teamSize =
    typeof raw.teamSize === "number" && raw.teamSize > 0
      ? Math.floor(raw.teamSize)
      : 1;

  const tools = raw.tools.map((tool) => migrateToolEntry(tool as LegacyToolEntry));

  const parsed = auditFormSchema.safeParse({ teamSize, tools });
  return parsed.success ? parsed.data : null;
}

export function migrateToolEntry(entry: LegacyToolEntry): AuditToolEntry {
  const toolId = SUPPORTED_TOOL_IDS.includes(entry.toolId as SupportedToolId)
    ? (entry.toolId as SupportedToolId)
    : "cursor";

  let planTierId = entry.planTierId?.trim() ?? "";

  if (!isValidPlanTier(toolId, planTierId) && entry.currentPlan) {
    planTierId =
      resolvePlanTierIdFromLegacy(toolId, entry.currentPlan) ??
      getDefaultPlanTierId(toolId);
  }

  if (!isValidPlanTier(toolId, planTierId)) {
    planTierId = getDefaultPlanTierId(toolId);
  }

  return {
    id: entry.id || crypto.randomUUID(),
    toolId,
    planTierId,
    monthlySpend:
      typeof entry.monthlySpend === "number" && entry.monthlySpend > 0
        ? entry.monthlySpend
        : 0,
    seats:
      typeof entry.seats === "number" && entry.seats > 0
        ? Math.floor(entry.seats)
        : 1,
    primaryUseCase: PRIMARY_USE_CASES.includes(entry.primaryUseCase)
      ? entry.primaryUseCase
      : "coding",
  };
}
