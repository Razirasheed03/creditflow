import { ImageResponse } from "next/og";

import {
  buildDefaultShareOgSubline,
} from "@/lib/share/public-metadata";
import { ShareOgImageContent } from "@/lib/share/og-image";

export const alt = "AI Spend Audit by CreditFlow";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <ShareOgImageContent
        headline="AI Spend Audit by CreditFlow"
        subline={buildDefaultShareOgSubline()}
      />
    ),
    { ...size }
  );
}
