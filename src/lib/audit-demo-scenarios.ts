import {
  defaultAuditFormValues,
  type AuditFormSchema,
} from "@/lib/audit-schema";

export const DEMO_SCENARIO_IDS = [
  "overspending_startup",
  "optimized_solo",
  "enterprise_heavy",
] as const;

export type DemoScenarioId = (typeof DEMO_SCENARIO_IDS)[number];

export type DemoScenario = {
  id: DemoScenarioId;
  label: string;
  description: string;
  values: AuditFormSchema;
};

export const AUDIT_DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "overspending_startup",
    label: "Overspending startup",
    description: "12-person team on expensive tiers with overlapping tools",
    values: {
      teamSize: 12,
      tools: [
        {
          id: "demo-os-1",
          toolId: "chatgpt",
          planTierId: "team",
          monthlySpend: 2400,
          seats: 18,
          primaryUseCase: "mixed",
        },
        {
          id: "demo-os-2",
          toolId: "cursor",
          planTierId: "business",
          monthlySpend: 960,
          seats: 24,
          primaryUseCase: "coding",
        },
        {
          id: "demo-os-3",
          toolId: "anthropic_api",
          planTierId: "scale",
          monthlySpend: 3200,
          seats: 1,
          primaryUseCase: "data_analysis",
        },
        {
          id: "demo-os-4",
          toolId: "github_copilot",
          planTierId: "business",
          monthlySpend: 380,
          seats: 20,
          primaryUseCase: "coding",
        },
      ],
    },
  },
  {
    id: "optimized_solo",
    label: "Optimized solo founder",
    description: "Right-sized individual plans with modest spend",
    values: {
      teamSize: 1,
      tools: [
        {
          id: "demo-solo-1",
          toolId: "cursor",
          planTierId: "pro",
          monthlySpend: 20,
          seats: 1,
          primaryUseCase: "coding",
        },
        {
          id: "demo-solo-2",
          toolId: "claude",
          planTierId: "pro",
          monthlySpend: 20,
          seats: 1,
          primaryUseCase: "writing",
        },
      ],
    },
  },
  {
    id: "enterprise_heavy",
    label: "Enterprise-heavy stack",
    description: "Large org on enterprise tiers — seat and tier review",
    values: {
      teamSize: 45,
      tools: [
        {
          id: "demo-ent-1",
          toolId: "cursor",
          planTierId: "enterprise",
          monthlySpend: 5400,
          seats: 90,
          primaryUseCase: "coding",
        },
        {
          id: "demo-ent-2",
          toolId: "chatgpt",
          planTierId: "enterprise",
          monthlySpend: 8100,
          seats: 135,
          primaryUseCase: "mixed",
        },
        {
          id: "demo-ent-3",
          toolId: "github_copilot",
          planTierId: "enterprise",
          monthlySpend: 3510,
          seats: 90,
          primaryUseCase: "coding",
        },
        {
          id: "demo-ent-4",
          toolId: "openai_api",
          planTierId: "scale",
          monthlySpend: 12000,
          seats: 1,
          primaryUseCase: "data_analysis",
        },
      ],
    },
  },
];

export function getDemoScenario(id: DemoScenarioId): AuditFormSchema {
  const scenario = AUDIT_DEMO_SCENARIOS.find((s) => s.id === id);
  return scenario?.values ?? defaultAuditFormValues();
}
