import { getAppOrigin } from "./app-origin";

/** Canonical public share path (no origin). */
export function getSharePath(shareId: string): string {
  return `/share/${shareId}`;
}

/**
 * Absolute share URL for copy/share/email.
 * Production builds prefer `NEXT_PUBLIC_APP_URL` so links stay canonical on Vercel.
 */
export function getPublicShareUrl(shareId: string): string {
  const path = getSharePath(shareId);
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    if (process.env.NODE_ENV === "production" && configured) {
      return `${configured}${path}`;
    }
    return `${window.location.origin}${path}`;
  }

  return `${getAppOrigin()}${path}`;
}
