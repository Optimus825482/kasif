"use client";

import { useState, useEffect } from "react";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState(0);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check sessionStorage only on client
    if (sessionStorage.getItem("splash-shown")) {
      setVisible(false);
      return;
    }

    setShouldShow(true);

    const t0 = setTimeout(() => setPhase(1), 100);
    const t1 = setTimeout(() => setPhase(2), 1200);
    const t2 = setTimeout(() => setPhase(3), 2000);
    const t3 = setTimeout(() => setPhase(4), 3500);
    const t4 = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("splash-shown", "1");
    }, 4000);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  if (!visible || !shouldShow) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0d9488 0%, #1d4ed8 100%)",
        transition: "opacity 0.5s ease",
        opacity: phase >= 4 ? 0 : 1,
        pointerEvents: phase >= 4 ? "none" : "auto",
      }}
    >
      {/* Logo */}
      <div
        style={{
          transform: phase >= 1 ? "scale(1)" : "scale(0.3)",
          opacity: phase >= 1 ? 1 : 0,
          transition:
            "transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease",
          filter:
            phase >= 2
              ? "drop-shadow(0 0 20px rgba(255,255,255,0.5))"
              : "drop-shadow(0 0 8px rgba(255,255,255,0.2))",
        }}
      >
        <img
          src="/logo.png"
          alt="Dijital Kaşif"
          width={130}
          height={130}
          style={{ borderRadius: 24 }}
        />
      </div>

      {/* Title */}
      <h1
        style={{
          marginTop: 24,
          fontSize: 30,
          fontWeight: 700,
          color: "white",
          letterSpacing: 1,
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        Dijital Kaşif
      </h1>

      {/* Subtitle */}
      <p
        style={{
          marginTop: 8,
          fontSize: 16,
          color: "rgba(255,255,255,0.8)",
          letterSpacing: 2,
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        Balıkesir
      </p>

      {/* Decorative ring */}
      <div
        style={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.15)",
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 2 ? "scale(1.3)" : "scale(0.8)",
          transition: "all 2s ease",
          pointerEvents: "none",
          top: "50%",
          left: "50%",
          marginTop: -100,
          marginLeft: -100,
        }}
      />
    </div>
  );
}
