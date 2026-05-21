import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-credex-green text-white [&>svg]:size-5",
        className
      )}
      aria-hidden
    >
      <svg viewBox="0 0 20 20" fill="none">
        <path
          d="M10 3c-2.5 0-4.5 2-4.5 4.5S7.5 12 10 12s4.5-2 4.5-4.5S12.5 3 10 3Zm0 14c-3.5 0-6.5-2.5-6.5-6h13c0 3.5-3 6-6.5 6Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

export function PlanCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200/90 bg-card p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] transition-shadow duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DarkPanel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-credex-dark p-7 text-credex-dark-foreground shadow-[0_8px_30px_rgba(15,46,46,0.15)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PlanRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-right text-sm font-medium text-foreground",
          highlight && "font-semibold text-credex-green"
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function TrustCheck({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
      <span className="flex size-[18px] items-center justify-center rounded-full bg-credex-green text-white">
        <Check className="size-2.5 stroke-[3]" aria-hidden />
      </span>
      {children}
    </span>
  );
}
