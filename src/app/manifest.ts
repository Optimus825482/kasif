import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Balıkesir Dijital Kaşif - Akıllı Turizm Platformu",
    short_name: "Dijital Kaşif",
    description:
      "Balıkesir'in turistik, tarihi ve kültürel değerlerini keşfedin",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0d9488",
    orientation: "portrait-primary",
    categories: ["travel", "navigation", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
