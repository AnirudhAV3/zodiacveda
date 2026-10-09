import type { Metadata } from "next";
import { FloatingGlyphs, SolarSystem, Starfield } from "@/components/Cosmos";
import Quotes from "@/components/Quotes";
import CalculatorDirectory from "@/components/calculators/CalculatorDirectory";
import HomeIntro from "@/components/HomeIntro";
import HomeQuoteHeading from "@/components/HomeQuoteHeading";
import HomeActions from "@/components/HomeActions";
import HomeStructuredData from "@/components/seo/HomeStructuredData";
import BrandLogo from "@/components/BrandLogo";


export const metadata: Metadata = {
  title: "Free Vedic Astrology Calculators & Kundli Online",
  description: "Use 13 free Vedic and Western astrology calculators for Kundli, horoscope matching, Jyotirlingas, planets, yogas, doshas, gemstones, divisional charts, Nakshatra and Dasha. Download your full birth-chart PDF free.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <HomeStructuredData />
      <Starfield />
      <nav className="relative z-50 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <BrandLogo compact />
        <HomeActions />
      </nav>

      <section className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 pb-16 pt-6 lg:grid-cols-2 lg:pt-12">
        <FloatingGlyphs />
        <div className="animate-fade-up relative z-10">
          <HomeIntro />
        </div>
        <div className="relative z-10">
          <SolarSystem />
        </div>
      </section>

      <section className="relative z-10 px-6 pb-20">
        <HomeQuoteHeading />
        <Quotes />
      </section>

      <CalculatorDirectory />
    </main>
  );
}
