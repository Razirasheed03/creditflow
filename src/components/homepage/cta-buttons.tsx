import { ArrowRight, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const primaryClass =
  "h-14 min-w-[260px] rounded-xl bg-neutral-900 px-10 text-lg font-semibold text-white hover:bg-neutral-800 sm:min-w-[280px] sm:h-[3.75rem] sm:text-xl";

const secondaryClass =
  "h-14 min-w-[260px] rounded-xl border-neutral-200 bg-white px-10 text-lg font-semibold text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-neutral-50 sm:min-w-[280px] sm:h-[3.75rem] sm:text-xl";

const secondaryOnDarkClass =
  "h-14 min-w-[260px] rounded-xl border-white/25 bg-transparent px-10 text-lg font-semibold text-white hover:bg-white/10 sm:min-w-[280px] sm:h-[3.75rem] sm:text-xl";

const primaryOnDarkClass =
  "h-14 min-w-[260px] rounded-xl bg-white px-10 text-lg font-semibold text-neutral-900 hover:bg-neutral-100 sm:min-w-[280px] sm:h-[3.75rem] sm:text-xl";

type CtaButtonsProps = {
  variant?: "light" | "dark";
  className?: string;
};

export function CtaButtons({ variant = "light", className }: CtaButtonsProps) {
  const isDark = variant === "dark";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 sm:flex-row",
        className
      )}
    >
      <Button size="lg" className={cn(isDark ? primaryOnDarkClass : primaryClass)} asChild>
        <a href="#cta">
          Start Free Audit
          <ArrowRight className="size-5" aria-hidden />
        </a>
      </Button>
      <Button
        size="lg"
        variant="outline"
        className={cn(isDark ? secondaryOnDarkClass : secondaryClass)}
        asChild
      >
        <a href="#demo">
          <Play className="size-5" aria-hidden />
          See Demo
        </a>
      </Button>
    </div>
  );
}
