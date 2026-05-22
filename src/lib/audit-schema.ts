import { z } from "zod";

import { PRIMARY_USE_CASES, SUPPORTED_TOOL_IDS } from "@/types/audit";

export const auditToolEntrySchema = z.object({
  id: z.string().min(1),
  toolId: z.enum(SUPPORTED_TOOL_IDS),
  currentPlan: z.string().min(1, "Enter your current plan name"),
  monthlySpend: z
    .number({ message: "Enter monthly spend" })
    .min(0, "Spend must be zero or positive"),
  seats: z
    .number({ message: "Enter seat count" })
    .int()
    .min(0, "Seats cannot be negative"),
  primaryUseCase: z.enum(PRIMARY_USE_CASES),
});

export const auditFormSchema = z.object({
  teamSize: z
    .number({ message: "Enter team size" })
    .int()
    .min(1, "Team size must be at least 1"),
  tools: z.array(auditToolEntrySchema).min(1, "Add at least one tool"),
});

export type AuditFormSchema = z.infer<typeof auditFormSchema>;

export const defaultToolEntry = (): z.infer<typeof auditToolEntrySchema> => ({
  id: crypto.randomUUID(),
  toolId: "cursor",
  currentPlan: "",
  monthlySpend: 0,
  seats: 1,
  primaryUseCase: "coding",
});

export const defaultAuditFormValues = (): AuditFormSchema => ({
  teamSize: 5,
  tools: [defaultToolEntry()],
});
