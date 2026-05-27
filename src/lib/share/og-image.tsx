const CREDEX_DARK = "#0f2e2e";
const CREDEX_GREEN = "#3d9a6f";
const FOREGROUND = "#f8fafc";

export type ShareOgImageContentProps = {
  headline: string;
  subline: string;
};

export function ShareOgImageContent({
  headline,
  subline,
}: ShareOgImageContentProps) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background: `linear-gradient(145deg, ${CREDEX_DARK} 0%, #134e4a 42%, ${CREDEX_DARK} 100%)`,
        color: FOREGROUND,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          backgroundColor: CREDEX_GREEN,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: CREDEX_GREEN,
            boxShadow: "0 8px 24px rgba(61, 154, 111, 0.35)",
          }}
        />
        <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em" }}>
          CreditFlow
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(248,250,252,0.55)",
          }}
        >
          AI Spend Audit
        </p>
        <h1
          style={{
            margin: 0,
            fontSize: 54,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            maxWidth: 1000,
          }}
        >
          {headline}
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 26,
            lineHeight: 1.35,
            color: "rgba(248,250,252,0.78)",
            maxWidth: 920,
          }}
        >
          {subline}
        </p>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: 20,
          color: "rgba(248,250,252,0.45)",
        }}
      >
        Shareable audit report · No contact details included
      </p>
    </div>
  );
}
