import { ImageResponse } from "next/og";

export const alt = "BytesPlatform — We Build Intelligent Digital Experiences";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(900px 520px at 22% 6%, rgba(77,141,255,0.30), transparent 62%), radial-gradient(700px 480px at 92% 96%, rgba(155,123,255,0.26), transparent 60%), #05060a",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: "linear-gradient(135deg,#58e6ff,#4d8dff 52%,#9b7bff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#05060a",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            B
          </div>
          <div style={{ display: "flex", color: "#f4f6fa", fontSize: 26, letterSpacing: -0.5 }}>
            <span>Bytes</span>
            <span style={{ color: "#8b929d" }}>Platform</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#f4f6fa",
              fontSize: 82,
              lineHeight: 1.02,
              letterSpacing: -3.4,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>We build intelligent</span>
            <span
              style={{
                background: "linear-gradient(100deg,#58e6ff,#4d8dff 46%,#9b7bff)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              digital experiences.
            </span>
          </div>
          <div style={{ color: "#8b929d", fontSize: 25, marginTop: 26, maxWidth: 880 }}>
            AI-powered products, scalable applications and intelligent systems — designed
            and engineered in-house.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 14,
            color: "#7d8593",
            fontSize: 19,
            borderTop: "1px solid rgba(255,255,255,0.10)",
            paddingTop: 22,
          }}
        >
          <span>AI Agents</span>
          <span>·</span>
          <span>Web &amp; Mobile</span>
          <span>·</span>
          <span>CRM Platforms</span>
          <span>·</span>
          <span>Custom Software</span>
        </div>
      </div>
    ),
    size
  );
}
