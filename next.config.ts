import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["jspdf", "jspdf-autotable"],
  async redirects() {
    return [
      { source: "/birth-chart-calculator", destination: "/build", permanent: true },
      { source: "/kundli-calculator", destination: "/build", permanent: true },
      { source: "/western-astrology-calculator", destination: "/calculators/western-astrology", permanent: true },
      { source: "/natal-chart-calculator", destination: "/calculators/western-astrology", permanent: true },
      { source: "/tropical-birth-chart", destination: "/calculators/western-astrology", permanent: true },
      { source: "/kundli-matching", destination: "/calculators/marriage-matching", permanent: true },
      { source: "/calculators/kundli-matching", destination: "/calculators/marriage-matching", permanent: true },
      { source: "/calculators/guna-milan", destination: "/calculators/marriage-matching", permanent: true },
      { source: "/calculators/kuja-dosha", destination: "/calculators/mangal-dosha", permanent: true },
      { source: "/marriage-horoscope-matching", destination: "/calculators/marriage-matching", permanent: true },
      { source: "/guna-milan-calculator", destination: "/calculators/marriage-matching", permanent: true },
      { source: "/yoga-calculator", destination: "/calculators/all-yogas", permanent: true },
      { source: "/dosha-calculator", destination: "/calculators/all-doshas", permanent: true },
      { source: "/gemstone-calculator", destination: "/calculators/gemstones", permanent: true },
      { source: "/navamsa-chart-calculator", destination: "/calculators/divisional-charts", permanent: true },
      { source: "/divisional-chart-calculator", destination: "/calculators/divisional-charts", permanent: true },
      { source: "/kaal-sarp-dosha-calculator", destination: "/calculators/kaal-sarp", permanent: true },
      { source: "/kal-sarp-dosha-calculator", destination: "/calculators/kaal-sarp", permanent: true },
      { source: "/kuja-dosha-calculator", destination: "/calculators/mangal-dosha", permanent: true },
      { source: "/mangal-dosha-calculator", destination: "/calculators/mangal-dosha", permanent: true },
      { source: "/manglik-calculator", destination: "/calculators/mangal-dosha", permanent: true },
      { source: "/nakshatra-calculator", destination: "/calculators/nakshatra-rashi", permanent: true },
      { source: "/rashi-calculator", destination: "/calculators/nakshatra-rashi", permanent: true },
      { source: "/vimshottari-dasha-calculator", destination: "/calculators/vimshottari-dasha", permanent: true },
      { source: "/mahadasha-calculator", destination: "/calculators/vimshottari-dasha", permanent: true },
      { source: "/sade-sati-calculator", destination: "/calculators/sade-sati", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/chart/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      {
        source: "/calculators/:calculator/:slug",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0, must-revalidate" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/api/charts/:slug/pdf",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
    ];
  },
};

export default nextConfig;
