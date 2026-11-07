import { ImageResponse } from "next/og";

export const alt = "HTube: the YouTube videos Hacker News keeps recommending";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Site-wide share card. Routes without their own image (everything but /watch) inherit it.
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "#0f0f0f", color: "#f1f1f1" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg width="112" height="112" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="7" fill="#FF6600" />
            <path fill="#FFF" d="M7 6h4v20H7zM21 6h4v20h-4zM11 12h10v8H11z" />
            <path fill="#FF6600" d="M14 14l5 2-5 2z" />
          </svg>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -2 }}>HTube</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1, maxWidth: 980 }}>
            The YouTube videos Hacker News keeps recommending
          </div>
          <div style={{ fontSize: 32, color: "#aaaaaa" }}>6,454 videos from 20 years of HN comments. No accounts.</div>
        </div>
      </div>
    ),
    size,
  );
}
