import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/homepage/primitives";

type SiteHeaderProps = {
  active?: "audit" | "results";
};

export function SiteHeader({ active }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 overflow-x-hidden border-b border-neutral-200/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl min-w-0 items-center justify-between gap-2 px-3 min-[375px]:gap-3 min-[375px]:px-4 sm:px-6 md:grid md:h-20 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-0 lg:h-[5.5rem] lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 shrink items-center gap-2 transition-opacity hover:opacity-80 min-[375px]:gap-3 md:gap-3"
        >
          <LogoMark className="size-10 shrink-0 min-[375px]:size-11 md:size-12 [&>svg]:size-6 min-[375px]:[&>svg]:size-[1.65rem] md:[&>svg]:size-7" />
          <span className="truncate text-lg font-semibold tracking-tight text-foreground min-[375px]:text-xl sm:text-[1.35rem]">
            creditflow
          </span>
        </Link>

        <nav
          className="hidden items-center gap-10 md:flex"
          aria-label="Main"
        >
          <Link
            href="/#how-it-works"
            className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            How it works
          </Link>
          <Link
            href="/audit"
            className={
              active === "audit"
                ? "text-base font-medium text-foreground"
                : "text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            Audit
          </Link>
        </nav>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 min-[375px]:gap-2.5 sm:gap-5">
          <Link
            href="/results"
            className={
              active === "results"
                ? "hidden text-base font-medium text-foreground sm:inline"
                : "hidden text-base font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
            }
          >
            Results
          </Link>
          <Button
            className="h-11 min-h-11 rounded-xl bg-neutral-900 px-4 text-sm font-semibold whitespace-nowrap text-white hover:bg-neutral-800 min-[375px]:px-5 md:h-12 md:min-h-12 md:px-6 md:text-base"
            asChild
          >
            <Link href="/audit">Start audit</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
