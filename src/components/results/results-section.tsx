import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ResultsSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function ResultsSection({
  title,
  description,
  children,
  className,
}: ResultsSectionProps) {
  return (
    <section className={cn("space-y-5", className)}>
      <div className="border-b border-neutral-100 pb-4">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
