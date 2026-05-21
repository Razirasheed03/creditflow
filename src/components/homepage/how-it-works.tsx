import { BarChart3, Link2, PiggyBank } from "lucide-react";

import { SectionHeading } from "@/components/homepage/section-heading";
import { PlanCard } from "@/components/homepage/primitives";

const steps = [
  {
    step: "01",
    title: "Connect your AI stack",
    description:
      "Link subscriptions, invoices, and API usage. CreditFlow maps spend across every tool your team uses.",
    icon: Link2,
  },
  {
    step: "02",
    title: "Analyze spending",
    description:
      "We break down seats, tiers, overages, and duplicate tools — with team-level usage insights.",
    icon: BarChart3,
  },
  {
    step: "03",
    title: "Discover savings",
    description:
      "Get recommended plans, cheaper alternatives, and AI-generated optimization summaries you can share.",
    icon: PiggyBank,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="How it works"
          title="From messy AI bills to clear savings"
          description="Three steps to understand where your budget goes — and what to change first."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {steps.map(({ step, title, description, icon: Icon }) => (
            <PlanCard key={step} className="p-8">
              <div className="mb-6 flex items-center justify-between">
                <span className="font-mono text-xs font-medium text-muted-foreground">
                  {step}
                </span>
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-credex-green">
                  <Icon className="size-5" aria-hidden />
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">{title}</h3>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {description}
              </p>
            </PlanCard>
          ))}
        </div>
      </div>
    </section>
  );
}
