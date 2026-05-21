import { DarkPanel } from "@/components/homepage/primitives";
import { CtaButtons } from "@/components/homepage/cta-buttons";

export function FinalCta() {
  return (
    <section id="cta" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <DarkPanel className="px-8 py-14 text-center sm:px-14 sm:py-16">
          <p className="text-xs font-semibold tracking-[0.14em] text-credex-dark-foreground/50 uppercase">
            Get started
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to audit your AI spend?
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-credex-dark-foreground/70">
            Join startups reducing AI costs without cutting the tools engineers
            rely on. Your first audit is free.
          </p>
          <CtaButtons variant="dark" className="mt-10" />
        </DarkPanel>
      </div>
    </section>
  );
}
