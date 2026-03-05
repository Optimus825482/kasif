import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Balıkesir Dijital Kaşif - Akıllı Turizm Platformu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        background:
          "linear-gradient(135deg, #0d9488 0%, #065f46 50%, #064e3b 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -60,
          left: -60,
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          display: "flex",
        }}
      />

      {/* Compass icon */}
      <div
        style={{
          fontSize: 80,
          marginBottom: 20,
          display: "flex",
        }}
      >
        🧭
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 64,
          fontWeight: 800,
          color: "white",
          textAlign: "center",
          lineHeight: 1.1,
          display: "flex",
        }}
      >
        Balıkesir Dijital Kaşif
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 28,
          color: "rgba(255,255,255,0.85)",
          marginTop: 16,
          textAlign: "center",
          display: "flex",
        }}
      >
        Akıllı Turizm Platformu
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 20,
          color: "rgba(255,255,255,0.6)",
          marginTop: 32,
          display: "flex",
          gap: 16,
          alignItems: "center",
        }}
      >
        <span>🏛️ Tarihi Yerler</span>
        <span>•</span>
        <span>🏖️ Plajlar</span>
        <span>•</span>
        <span>🍽️ Gastronomi</span>
        <span>•</span>
        <span>♨️ Termal</span>
      </div>

      {/* Domain */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          fontSize: 18,
          color: "rgba(255,255,255,0.5)",
          display: "flex",
        }}
      >
        kasif.erkanerdem.net
      </div>
    </div>,
    { ...size },
  );
}
