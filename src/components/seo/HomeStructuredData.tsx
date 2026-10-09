import { CALCULATOR_SEO, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo/catalog";
import JsonLd from "./JsonLd";

export default function HomeStructuredData() {
  const tools = Object.values(CALCULATOR_SEO);
  return (
    <JsonLd
      data={[
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          alternateName: "Zodiac Veda Vedic Astrology Calculators",
          url: SITE_URL,
          description: "Free Vedic and Western astrology calculators for Kundli, horoscope matching, Jyotirlinga suggestions, yogas, doshas, gemstones, divisional charts, Nakshatra, Dasha and Sade Sati.",
          inLanguage: "en",
          publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        },
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          logo: absoluteUrl("/icon.svg"),
          description: "Vedic astrology calculation and educational reporting platform.",
        },
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Free Vedic Astrology Calculators",
          numberOfItems: tools.length,
          itemListElement: tools.map((tool, i) => ({ "@type": "ListItem", position: i + 1, name: tool.name, url: absoluteUrl(tool.path) })),
        },
      ]}
    />
  );
}
