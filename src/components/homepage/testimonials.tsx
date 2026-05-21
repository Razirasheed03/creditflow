import { SectionHeading } from "@/components/homepage/section-heading";
import { PlanCard } from "@/components/homepage/primitives";

const testimonials = [
  {
    quote:
      "We found $14k in annual savings in the first audit — mostly from duplicate ChatGPT seats and an oversized Cursor plan.",
    author: "Maya Chen",
    role: "VP Engineering",
    company: "Latticeflow",
  },
  {
    quote:
      "CreditFlow gave us a board-ready report in minutes. Finance finally has visibility into our AI line item.",
    author: "James Okonkwo",
    role: "Head of Finance",
    company: "Stackpath",
  },
  {
    quote:
      "The alternative recommendations were spot-on. We consolidated API routing and cut Anthropic spend by 28%.",
    author: "Priya Nair",
    role: "Staff Platform Engineer",
    company: "Northwind Labs",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Teams like yours"
          title="Trusted by fast-moving startups"
          description="Engineering and finance leaders use CreditFlow to get ahead of runaway AI spend."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {testimonials.map(({ quote, author, role, company }) => (
            <PlanCard key={author} className="flex flex-col p-8">
              <p className="flex-1 text-base leading-relaxed text-foreground">
                &ldquo;{quote}&rdquo;
              </p>
              <footer className="mt-8 border-t border-neutral-100 pt-6">
                <p className="font-semibold">{author}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {role} · {company}
                </p>
              </footer>
            </PlanCard>
          ))}
        </div>
      </div>
    </section>
  );
}
