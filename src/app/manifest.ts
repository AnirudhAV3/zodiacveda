import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zodiac Veda — Vedic Astrology Calculators",
    short_name: "Zodiac Veda",
    description: "Free Vedic astrology Kundli and focused Jyotish calculators.",
    start_url: "/",
    display: "standalone",
    background_color: "#05040f",
    theme_color: "#0b0a1f",
    lang: "en-IN",
    categories: ["lifestyle", "education", "utilities"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
