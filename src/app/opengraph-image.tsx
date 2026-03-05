import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "Balıkesir Dijital Kaşif - Akıllı Turizm Platformu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const logoData = await readFile(join(process.cwd(), "public", "logo.png"));
  const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        background:
          "linear-gradient(135deg, #0f766e 0%, #065f46 40%, #064e3b 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        fontFamily: "sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: 300,
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
          display: "flex",
        }}
      />

      {/* Left side - Logo area */}
      <div
        style={{
          width: "35%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.15)",
        }}
      >
        {/* App Logo */}
        <img
          src={logoBase64}
          width={180}
          height={180}
          style={{
            borderRadius: 30,
            marginBottom: 20,
          }}
        />
        <div
          style={{
            display: "flex",
            gap: 12,
            fontSize: 36,
          }}
        >
          <span>🏛️</span>
          <span>🏖️</span>
          <span>🍽️</span>
          <span>♨️</span>
        </div>
      </div>

      {/* Right side - Text area */}
      <div
        style={{
          width: "65%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "40px 60px 40px 50px",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: 20,
              padding: "6px 18px",
              fontSize: 18,
              color: "rgba(255,255,255,0.9)",
              display: "flex",
              letterSpacing: 1,
            }}
          >
            BALIKESİR
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            lineHeight: 1.05,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Dijital</span>
          <span>Kaşif</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 26,
            color: "rgba(255,255,255,0.75)",
            marginTop: 20,
            display: "flex",
          }}
        >
          Akıllı Turizm Platformu
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 18,
            color: "rgba(255,255,255,0.5)",
            marginTop: 12,
            display: "flex",
          }}
        >
          Tarihi Yerler • Plajlar • Gastronomi • Termal
        </div>

        {/* Domain */}
        <div
          style={{
            fontSize: 20,
            color: "rgba(255,255,255,0.4)",
            marginTop: 30,
            display: "flex",
            letterSpacing: 0.5,
          }}
        >
          kasif.erkanerdem.net
        </div>
      </div>
    </div>,
    { ...size },
  );
}
