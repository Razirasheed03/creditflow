import {
  BarChart2,
  FileText,
  Layers,
  RefreshCw,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";

import { SectionHeading } from "@/components/homepage/section-heading";
import { PlanCard } from "@/components/homepage/primitives";

const features = [
  {
    title: "AI spend analysis",
    description:
      "Unified view of subscriptions, API bills, and seat utilization across your stack.",
    icon: BarChart2,
  },
  {
    title: "Plan optimization",
    description:
      "Right-size tiers and seat counts based on how your team actually uses each tool.",
    icon: Layers,
  },
  {
    title: "Alternative recommendations",
    description:
      "Discover cheaper tools and bundles when overlap or underuse is costing you.",
    icon: RefreshCw,
  },
  {
    title: "Shareable reports",
    description:
      "Export polished audit reports for finance, leadership, and board updates.",
    icon: Share2,
  },
  {
    title: "AI-generated summaries",
    description:
      "Plain-language optimization briefs with prioritized actions and rationale.",
    icon: Sparkles,
  },
  {
    title: "Team usage insights",
    description:
      "See which squads drive spend — and where consolidation saves the most.",
    icon: Users,
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-neutral-200/80 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Platform"
          title="Everything you need to control AI costs"
          description="Purpose-built for startups and engineering orgs — not generic expense tracking."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ title, description, icon: Icon }) => (
            <PlanCard key={title} className="p-7">
              <span className="mb-5 flex size-11 items-center justify-center rounded-xl bg-accent text-credex-green">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="text-lg font-bold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </PlanCard>
          ))}
        </div>

        <p className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <FileText className="size-4 text-credex-green" aria-hidden />
          SOC 2-ready reporting · Finance-friendly exports
        </p>
      </div>
    </section>
  );
}
