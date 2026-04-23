import { ImageResponse } from "next/og";

export const alt = "Reportly — AI client reports for marketing agencies";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #0a1a3e 0%, #1e3a8a 50%, #3475EF 100%)",
          color: "#ffffff",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* Top: mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#3475EF",
              fontSize: 52,
              fontWeight: 900,
              letterSpacing: "-0.04em",
            }}
          >
            R
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#ffffff",
            }}
          >
            Reportly
          </div>
        </div>

        {/* Middle: headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: "#ffffff",
            }}
          >
            Client reports in
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: "#93c5fd",
            }}
          >
            60 seconds.
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 500,
              color: "rgba(255, 255, 255, 0.85)",
              maxWidth: 800,
              marginTop: 12,
            }}
          >
            AI-written narratives. GA4 + Search Console. Branded PDFs. Done.
          </div>
        </div>

        {/* Bottom: domain + badges */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.7)",
              letterSpacing: "0.02em",
            }}
          >
            reportlyapps.com
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              fontSize: 16,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            <div
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              14-day free trial
            </div>
            <div
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              No credit card
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
