import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SplashScreen } from "@/components/layout/splash-screen";
import { PwaInstallPrompt } from "@/components/layout/pwa-install";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://kasif.erkanerdem.net"),
  title: "Balıkesir Dijital Kaşif - Akıllı Turizm Platformu",
  description:
    "Balıkesir'in turistik, tarihi ve kültürel değerlerini dijital ortamda keşfedin. Harita tabanlı akıllı turizm rehberi.",
  keywords: [
    "Balıkesir",
    "turizm",
    "dijital kaşif",
    "akıllı şehir",
    "PWA",
    "harita",
  ],
  authors: [{ name: "Balıkesir Dijital Kaşif" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Dijital Kaşif",
  },
  openGraph: {
    title: "Balıkesir Dijital Kaşif",
    description: "Balıkesir'in turistik değerlerini keşfedin",
    type: "website",
    url: "https://kasif.erkanerdem.net",
    siteName: "Balıkesir Dijital Kaşif",
    locale: "tr_TR",
    images: [
      {
        url: "https://kasif.erkanerdem.net/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Balıkesir Dijital Kaşif - Akıllı Turizm Platformu",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Balıkesir Dijital Kaşif",
    description: "Balıkesir'in turistik değerlerini keşfedin",
    images: [
      {
        url: "https://kasif.erkanerdem.net/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Balıkesir Dijital Kaşif - Akıllı Turizm Platformu",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head />
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <SplashScreen />
          {children}
          <BottomNav />
          <PwaInstallPrompt />
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
