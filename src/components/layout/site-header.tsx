import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/homepage/primitives";

type SiteHeaderProps = {
  active?: "audit" | "results";
};

export function SiteHeader({ active }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto grid h-20 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:h-[5.5rem] lg:px-8">
        <Link
          href="/"
          className="flex w-fit items-center gap-3 transition-opacity hover:opacity-80"
        >
          <LogoMark className="size-12 [&>svg]:size-7" />
          <span className="text-xl font-semibold tracking-tight text-foreground sm:text-[1.35rem]">
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

        <div className="flex items-center justify-end gap-5">
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
            className="h-12 rounded-xl bg-neutral-900 px-6 text-base font-semibold text-white hover:bg-neutral-800"
            asChild
          >
            <Link href="/audit">Start audit</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
