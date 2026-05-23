import { BrandIcon, type BrandId } from "@/components/homepage/brand-icon";
import { PlanCard, PlanRow } from "@/components/homepage/primitives";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/data/pricing";
import type { RecommendationType, ToolRecommendation } from "@/types/audit";
import { cn } from "@/lib/utils";

const TOOL_BRAND_MAP: Partial<Record<string, BrandId>> = {
  cursor: "cursor",
  github_copilot: "copilot",
  claude: "claude",
  chatgpt: "openai",
  anthropic_api: "anthropic",
  openai_api: "openai",
  gemini: "gemini",
};

const TYPE_LABELS: Record<RecommendationType, string> = {
  downgrade: "Plan optimization",
  alternative: "Alternative",
  credit: "Credit opportunity",
  optimized: "Already optimized",
  overlap: "Stack overlap",
};

const PRIORITY_LABELS = {
  high: "High impact",
  medium: "Medium impact",
  low: "Low impact",
} as const;

type RecommendationCardProps = {
  recommendation: ToolRecommendation;
};

export function RecommendationCard({ recommendation: rec }: RecommendationCardProps) {
  const brand = TOOL_BRAND_MAP[rec.toolId];

  return (
    <PlanCard className="p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          {brand ? <BrandIcon brand={brand} size="lg" /> : null}
          <div>
            <h3 className="text-lg font-bold">{rec.toolName}</h3>
            <p className="text-sm text-muted-foreground">
              {rec.seats} seat{rec.seats === 1 ? "" : "s"} ·{" "}
              {rec.primaryUseCase.replace(/_/g, " ")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {rec.inputInvalid ? (
            <Badge variant="outline" className="border-amber-300 text-amber-900">
              Invalid input
            </Badge>
          ) : (
            <>
              <Badge
                variant="outline"
                className={cn(
                  "border-primary/30 bg-accent text-accent-foreground",
                  rec.alreadyOptimized &&
                    "border-border bg-muted text-muted-foreground"
                )}
              >
                {TYPE_LABELS[rec.recommendationType]}
              </Badge>
              {!rec.alreadyOptimized ? (
                <Badge
                  variant="outline"
                  className="border-border text-muted-foreground"
                >
                  {PRIORITY_LABELS[rec.priority]}
                </Badge>
              ) : null}
            </>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-100 bg-muted/30 px-4 py-3">
          <p className="text-xs text-muted-foreground">Current</p>
          <p className="mt-1 text-xl font-bold tabular-nums">
            {formatCurrency(rec.currentSpend)}
            <span className="text-sm font-normal text-muted-foreground">/mo</span>
          </p>
        </div>
        <div className="rounded-xl border border-neutral-100 bg-muted/30 px-4 py-3">
          <p className="text-xs text-muted-foreground">Recommended</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-credex-green">
            {formatCurrency(rec.recommendedSpend)}
            <span className="text-sm font-normal text-muted-foreground">/mo</span>
          </p>
        </div>
        <div className="rounded-xl border border-neutral-100 bg-muted/30 px-4 py-3">
          <p className="text-xs text-muted-foreground">Savings</p>
          <p className="mt-1 text-xl font-bold tabular-nums">
            {rec.monthlySavings > 0 ? (
              <>
                {formatCurrency(rec.monthlySavings)}
                <span className="text-sm font-normal text-muted-foreground">
                  /mo ({formatPercent(rec.savingsPercent)})
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </p>
        </div>
      </div>

      <div className="mt-6 divide-y divide-neutral-100">
        <PlanRow label="Current plan" value={rec.currentPlan} />
        <PlanRow label="Recommended plan" value={rec.recommendedPlan} />
        {rec.catalogBenchmark !== undefined && rec.catalogBenchmark > 0 ? (
          <PlanRow
            label="Catalog benchmark"
            value={`${formatCurrency(rec.catalogBenchmark)}/mo`}
          />
        ) : null}
        <PlanRow
          label="Annual savings"
          value={
            rec.annualSavings > 0
              ? formatCurrency(rec.annualSavings)
              : "—"
          }
          highlight={rec.annualSavings > 0}
        />
      </div>

      <p className="mt-6 rounded-xl bg-muted/60 p-4 text-sm leading-relaxed text-foreground">
        {rec.reasoning}
      </p>

      {rec.actionItems.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {rec.actionItems.map((item) => (
            <li
              key={item}
              className="flex gap-2 text-sm text-muted-foreground before:mt-2 before:size-1.5 before:shrink-0 before:rounded-full before:bg-credex-green"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </PlanCard>
  );
}
