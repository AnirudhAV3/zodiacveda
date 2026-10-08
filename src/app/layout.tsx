import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import SiteFooter from "@/components/SiteFooter";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo/catalog";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Free Vedic Astrology Calculators & Kundli — Zodiac Veda",
    template: "%s | Zodiac Veda",
  },
  description: "Free Vedic astrology calculators for Kundli, Guna Milan, Kuja and Kaal Sarp Dosha, Yogas, gemstones, Shodashvarga, Nakshatra, Vimshottari Dasha and Sade Sati.",
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Vedic Astrology",
  classification: "Vedic astrology calculators and educational reports",
  keywords: ["Vedic astrology calculators", "free Kundli calculator", "Jyotish", "birth chart calculator", "Kundli matching", "Kuja Dosha calculator", "Nakshatra calculator"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Free Vedic Astrology Calculators & Kundli",
    description: "Accurate Lahiri sidereal Kundli, matching, Yogas, Doshas, gemstones, divisional charts, Dasha and Sade Sati calculators.",
    images: [{ url: absoluteUrl("/opengraph-image"), width: 1200, height: 630, alt: "Zodiac Veda Vedic Astrology Calculators" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Vedic Astrology Calculators & Kundli",
    description: "Kundli, horoscope matching, Kuja Dosha, Nakshatra, Dasha, Yogas, gemstones and more.",
    images: [absoluteUrl("/opengraph-image")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
  },
  manifest: "/manifest.webmanifest",
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }], apple: "/icon.svg" },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
  other: {
    "theme-color": "#0b0a1f",
    "format-detection": "telephone=no",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
  themeColor: "#0b0a1f",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
