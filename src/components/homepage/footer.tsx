import Link from "next/link";

import { LogoMark } from "@/components/homepage/primitives";
import { DEMO_VIDEO_URL } from "@/lib/demo-link";

const footerLinks = {
  Product: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Savings preview", href: "#savings" },
    { label: "Demo video", href: DEMO_VIDEO_URL, external: true },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Security", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-neutral-200/80 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <LogoMark />
              <span className="text-lg font-semibold tracking-tight">
                creditflow
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Professional AI spend auditing for startups and engineering
              teams.
            </p>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="text-sm font-semibold">{group}</p>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      {...("external" in link && link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-neutral-100 pt-8 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} CreditFlow. All rights reserved.</p>
          <p>Built for teams who ship fast and spend smarter.</p>
        </div>
      </div>
    </footer>
  );
}
