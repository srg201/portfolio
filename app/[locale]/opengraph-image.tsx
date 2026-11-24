import { ImageResponse } from "next/og";

export const alt = "Sergey Belyakov — Full-stack developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/*
 * Цвета: hex-приближения токенов тёмной темы из globals.css
 * (Satori не понимает CSS-переменные и oklch).
 */
const background = "#141010";
const foreground = "#f4f1ec";
const muted = "#aca39b";
const brand = "#f2733c";

/**
 * Картинка для соцсетей. Текст на английском на всех языках: встроенный
 * шрифт next/og не содержит CJK, деванагари и арабицы.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background,
          color: foreground,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 24, color: muted, letterSpacing: 4 }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: brand }} />
          FULL-STACK DEVELOPER
        </div>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 0.9 }}>
          <div style={{ fontSize: 64, fontWeight: 300 }}>Sergey</div>
          <div style={{ fontSize: 196, letterSpacing: -8 }}>Belyakov</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: muted }}>
          <span>Websites · Web apps · Motion</span>
          <span style={{ color: brand }}>Next.js · React · TypeScript</span>
        </div>
      </div>
    ),
    size,
  );
}
