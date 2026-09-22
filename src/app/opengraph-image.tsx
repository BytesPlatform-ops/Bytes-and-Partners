import { ImageResponse } from "next/og";

export const alt = "BytesPlatform — Bytes and Partners";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** A still of the page: the same composition, resolved. */
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
          background: "#f5f2ea",
          padding: 52,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#111111",
            fontSize: 14,
            letterSpacing: 2.4,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          <span>Bytes &amp; Partners</span>
          <span style={{ display: "flex", alignItems: "center", gap: 10, color: "#6b665d" }}>
            <span
              style={{ width: 7, height: 7, borderRadius: 999, background: "#2457ff" }}
            />
            Start a project
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            color: "#111111",
            fontSize: 176,
            fontWeight: 800,
            letterSpacing: -9,
            lineHeight: 1,
          }}
        >
          BytesPlatform
          {/* drawn, not typed: Satori's fallback face renders a square period */}
          <span
            style={{
              display: "flex",
              width: 30,
              height: 30,
              borderRadius: 999,
              background: "#2457ff",
              marginLeft: 14,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#6b665d",
            fontSize: 13,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          <span>Technology studio / New York</span>
          <span>bytesandpartners.co</span>
        </div>
      </div>
    ),
    size,
  );
}
