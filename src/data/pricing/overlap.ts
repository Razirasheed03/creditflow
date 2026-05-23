import type { AuditToolEntry } from "@/types/audit";

import { getToolPricing } from "./helpers";
import type { OverlapGroup } from "./types";

export const OVERLAP_GROUPS: OverlapGroup[] = [
  {
    id: "ide_coding",
    label: "AI coding assistants",
    toolIds: ["cursor", "github_copilot", "windsurf", "v0"],
    minCombinedSpend: 80,
    message:
      "Multiple IDE copilots often duplicate inline-completion spend. Most teams standardize on one primary editor integration.",
  },
  {
    id: "chat_assistants",
    label: "Chat assistants",
    toolIds: ["chatgpt", "claude", "gemini"],
    minCombinedSpend: 100,
    message:
      "Running Team/Business workspaces on several chat assistants in parallel rarely scales — consolidate general-purpose chat to one platform.",
  },
  {
    id: "llm_apis",
    label: "LLM APIs",
    toolIds: ["openai_api", "anthropic_api"],
    minCombinedSpend: 500,
    message:
      "Dual production API vendors increase committed spend and engineering surface area. Route by workload or model capability instead of duplicating full stacks.",
  },
];

export type DetectedOverlap = {
  groupId: string;
  label: string;
  toolNames: string[];
  combinedSpend: number;
  message: string;
};

export function detectStackOverlaps(
  entries: AuditToolEntry[]
): DetectedOverlap[] {
  const detected: DetectedOverlap[] = [];

  for (const group of OVERLAP_GROUPS) {
    const matched = entries.filter((e) => group.toolIds.includes(e.toolId));
    if (matched.length < 2) continue;

    const combinedSpend = matched.reduce((s, e) => s + e.monthlySpend, 0);
    if (group.minCombinedSpend && combinedSpend < group.minCombinedSpend) {
      continue;
    }

    detected.push({
      groupId: group.id,
      label: group.label,
      toolNames: matched.map((e) => getToolPricing(e.toolId).displayName),
      combinedSpend,
      message: group.message,
    });
  }

  return detected;
}
