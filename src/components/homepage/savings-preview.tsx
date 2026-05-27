import { ArrowRight, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BrandIcon, type BrandId } from "@/components/homepage/brand-icon";
import { PlanCard, PlanRow } from "@/components/homepage/primitives";
import { SectionHeading } from "@/components/homepage/section-heading";
import { DEMO_VIDEO_URL } from "@/lib/demo-link";

const audits: {
  tool: string;
  brand: BrandId;
  seats: string;
  current: string;
  validity: string;
  recommended: string;
  optimized: string;
  savings: string;
}[] = [
  {
    tool: "ChatGPT Team",
    brand: "openai",
    seats: "48 seats",
    current: "$2,400 / mo",
    validity: "Monthly",
    recommended: "Team @ 32 seats",
    optimized: "$1,600 / mo",
    savings: "$800 / mo",
  },
  {
    tool: "Cursor Business",
    brand: "cursor",
    seats: "24 developers",
    current: "$960 / mo",
    validity: "Monthly",
    recommended: "Pro + selective Business",
    optimized: "$480 / mo",
    savings: "$480 / mo",
  },
  {
    tool: "Anthropic API",
    brand: "anthropic",
    seats: "Production workloads",
    current: "$3,200 / mo",
    validity: "Usage-based",
    recommended: "Tier + batch routing",
    optimized: "$2,100 / mo",
    savings: "$1,100 / mo",
  },
];

export function SavingsPreview() {
  return (
    <section id="demo" className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            align="left"
            label="Audit preview"
            title="See what an audit surfaces"
            description="Sample findings from a Series A engineering team."
            className="mx-0 max-w-xl text-left"
          />
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="rounded-xl border-neutral-200 bg-white hover:bg-neutral-50"
              asChild
            >
              <a
                href={DEMO_VIDEO_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Play className="size-4" aria-hidden />
                Watch demo video
              </a>
            </Button>
            <Button
              className="rounded-xl bg-neutral-900 px-5 text-white hover:bg-neutral-800"
              asChild
            >
              <a href="/results?demo=1">
                View sample report
                <ArrowRight className="size-4" aria-hidden />
              </a>
            </Button>
          </div>
        </div>

        <div id="savings" className="mt-12 grid gap-5 lg:grid-cols-3">
          {audits.map((audit) => (
            <PlanCard key={audit.tool}>
              <BrandIcon brand={audit.brand} size="lg" className="mb-8" />
              <div className="divide-y divide-neutral-100">
                <PlanRow label="Product" value={audit.tool} />
                <PlanRow label="Scope" value={audit.seats} />
                <PlanRow label="Validity" value={audit.validity} />
                <PlanRow label="Current spend" value={audit.current} />
                <PlanRow label="Recommended" value={audit.recommended} />
                <PlanRow label="Optimized" value={audit.optimized} highlight />
                <PlanRow label="Estimated savings" value={audit.savings} highlight />
              </div>
            </PlanCard>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Illustrative data · Results reflect your actual usage and billing
        </p>
      </div>
    </section>
  );
}
