import { cn } from "@/lib/utils";

import {
  brandIcons,
  type BrandId,
  type BrandIconData,
} from "@/components/homepage/brand-icons-data";

export type { BrandId };

export function BrandLogo({
  icon,
  className,
}: {
  icon: BrandIconData;
  className?: string;
}) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label={icon.title}
    >
      <path fill={`#${icon.hex}`} d={icon.path} />
    </svg>
  );
}

export function BrandIcon({
  brand,
  size = "md",
  className,
}: {
  brand: BrandId;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const icon = brandIcons[brand];
  const logoSize =
    size === "sm" ? "size-7" : size === "lg" ? "size-11" : "size-9";

  return (
    <div
      className={cn("flex shrink-0 items-center justify-center", className)}
      title={icon.title}
    >
      <BrandLogo icon={icon} className={logoSize} />
    </div>
  );
}

export function BrandTile({
  brand,
  className,
}: {
  brand: BrandId;
  className?: string;
}) {
  const icon = brandIcons[brand];

  return (
    <div
      className={cn(
        "flex size-[5.25rem] items-center justify-center rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)]",
        className
      )}
      title={icon.title}
    >
      <BrandLogo icon={icon} className="size-10" />
    </div>
  );
}
