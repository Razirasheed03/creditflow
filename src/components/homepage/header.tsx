import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/homepage/primitives";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Savings", href: "#savings" },
  { label: "Features", href: "#features" },
];

export function Header() {
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
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-5">
          <a
            href="#demo"
            className="hidden text-base font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            See demo
          </a>
          <Button
            className="h-12 rounded-xl bg-neutral-900 px-6 text-base font-semibold text-white hover:bg-neutral-800"
            asChild
          >
            <a href="#cta">Start audit</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
