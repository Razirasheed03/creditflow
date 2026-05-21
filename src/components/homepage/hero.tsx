import { BrandTile, type BrandId } from "@/components/homepage/brand-icon";
import { CtaButtons } from "@/components/homepage/cta-buttons";
import { DarkPanel, TrustCheck } from "@/components/homepage/primitives";

const trustItems = [
  "No credit card required",
  "Finance-ready reports",
  "Built for engineering teams",
];

const floatingBrands: { brand: BrandId; className: string }[] = [
  { brand: "openai", className: "left-[2%] top-[12%] -rotate-6" },
  { brand: "aws", className: "right-[3%] top-[10%] rotate-6" },
  { brand: "claude", className: "left-[8%] top-[48%] -rotate-3" },
  { brand: "gemini", className: "right-[10%] top-[44%] rotate-3" },
  { brand: "cursor", className: "left-[4%] bottom-[18%] rotate-6" },
  { brand: "copilot", className: "right-[6%] bottom-[16%] -rotate-6" },
];

const stats = [
  { value: "34%", label: "Avg. savings identified" },
  { value: "12+", label: "Tools per audit" },
  { value: "< 2 min", label: "Report generation" },
  { value: "$14k", label: "Typical annual savings" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="credex-hero-grid absolute inset-0" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pb-28 sm:pt-14 lg:px-8">
        {/* Hero copy + floating tiles */}
        <div className="relative mx-auto flex min-h-[420px] max-w-4xl flex-col items-center justify-center text-center lg:min-h-[480px]">
          <div
            className="pointer-events-none absolute inset-0 hidden lg:block"
            aria-hidden
          >
            {floatingBrands.map(({ brand, className }) => (
              <BrandTile
                key={brand}
                brand={brand}
                className={`absolute ${className}`}
              />
            ))}
          </div>

          <div className="relative z-10">
            <div className="mb-8 inline-flex overflow-hidden rounded-full border border-neutral-200 bg-white text-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <span className="bg-accent px-4 py-2 font-semibold text-accent-foreground">
                FREE AUDIT
              </span>
              <span className="px-4 py-2 text-muted-foreground">
                No card required · Setup in 5 minutes
              </span>
            </div>

            <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.25rem]">
              <span className="text-credex-green">Cut AI spend up to 34%</span>
              <br />
              <span className="text-foreground">
                across your entire AI stack
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Audit ChatGPT, Claude, Cursor, Copilot, and API bills — get
              cheaper plans, alternatives, and shareable reports finance will
              trust.
            </p>

            <CtaButtons className="mt-9" />
          </div>
        </div>

        <ul className="relative z-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-neutral-200/80 pt-10">
          {trustItems.map((item) => (
            <li key={item}>
              <TrustCheck>{item}</TrustCheck>
            </li>
          ))}
        </ul>

        {/* Credex-style bento stats (still part of hero) */}
        <div className="relative z-10 mt-16 grid gap-4 lg:grid-cols-12 lg:gap-5">
          <DarkPanel className="flex flex-col justify-between lg:col-span-5 lg:min-h-[320px]">
            <div>
              <p className="text-xs font-medium tracking-[0.12em] text-credex-dark-foreground/50 uppercase">
                Tap in
              </p>
              <h2 className="mt-4 text-2xl font-bold leading-snug tracking-tight sm:text-[1.65rem]">
                Stop overpaying for AI tools your team barely uses
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-credex-dark-foreground/70">
                CreditFlow maps subscriptions, seats, and API usage — then
                surfaces the fastest paths to cut spend without blocking
                engineering.
              </p>
            </div>
          </DarkPanel>

          <div className="grid grid-cols-2 gap-4 lg:col-span-7 lg:gap-5">
            {stats.map((stat) => (
              <DarkPanel
                key={stat.label}
                className="flex flex-col justify-center py-8"
              >
                <p className="text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-credex-dark-foreground/65">
                  {stat.label}
                </p>
              </DarkPanel>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
