import type { Metadata } from "next";

import { getAppOrigin } from "@/lib/share/app-origin";

export const metadata: Metadata = {
  metadataBase: new URL(getAppOrigin()),
};

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
