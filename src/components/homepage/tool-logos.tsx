import { BrandTile, type BrandId } from "@/components/homepage/brand-icon";

const tools: BrandId[] = [
  "openai",
  "claude",
  "cursor",
  "copilot",
  "gemini",
  "anthropic",
  "aws",
];

export function ToolLogos() {
  return (
    <section className="border-y border-neutral-200/80 bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted-foreground">
          Same platforms your team already uses — audited in one place
        </p>
        <ul className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
          {tools.map((brand) => (
            <li key={brand}>
              <BrandTile brand={brand} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
