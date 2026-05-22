import { AuditForm } from "@/components/audit/audit-form";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata = {
  title: "AI Spend Audit — CreditFlow",
  description:
    "Enter your AI tool spending and receive intelligent audit recommendations.",
};

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader active="audit" />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Free audit
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Audit your AI stack
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Add your tools, plans, and spend. CreditFlow analyzes overprovisioned
            tiers, seat waste, and cheaper alternatives — no account required.
          </p>
        </div>
        <AuditForm />
      </main>
      <SiteFooter />
    </div>
  );
}
