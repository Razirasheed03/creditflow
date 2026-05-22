import { ResultsDashboard } from "@/components/results/results-dashboard";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata = {
  title: "Audit Results — CreditFlow",
  description: "Your AI spend audit recommendations and savings analysis.",
};

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader active="results" />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Results
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Your audit results
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Recommendations are based on your inputs and published pricing
            benchmarks — not manufactured savings.
          </p>
        </div>
        <ResultsDashboard />
      </main>
      <SiteFooter />
    </div>
  );
}
