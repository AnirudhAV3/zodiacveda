import type { Metadata } from "next";
import { FloatingGlyphs, SolarSystem, Starfield } from "@/components/Cosmos";
import Quotes from "@/components/Quotes";
import CalculatorDirectory from "@/components/calculators/CalculatorDirectory";
import SiteFooter from "@/components/SiteFooter";
import BuildChartButton from "@/components/BuildChartButton";
import HomeStructuredData from "@/components/seo/HomeStructuredData";
import BrandLogo from "@/components/BrandLogo";


export const metadata: Metadata = {
  title: "Free Vedic Astrology Calculators & Kundli Online",
  description: "Use 12 free astrology calculators for Vedic Kundli, Western natal charts, matching, yogas, doshas, gemstones, divisional charts, Nakshatra and Dasha. Download your full birth-chart PDF free.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <main className="relative overflow-x-hidden">
      <HomeStructuredData />
      <Starfield />
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <BrandLogo compact />
        <BuildChartButton variant="nav" />
      </nav>

      <section className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 pb-16 pt-6 lg:grid-cols-2 lg:pt-12">
        <FloatingGlyphs />
        <div className="animate-fade-up relative z-10">
          <p className="label-caps !text-amber-300">Vedic Astrology · Jyotiṣa Śāstra</p>
          <h1 className="mt-4 font-serif text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
            <span className="text-shimmer">Decode the sky</span>
            <br />
            <span className="text-slate-100">the moment you were born</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-300">
            Precise birth charts, divisional charts, dashas and time-tested predictions of your past, present and future — career, marriage, children, wealth and more.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <BuildChartButton variant="hero" />
            <span className="text-sm text-slate-400">Free · No sign-up · Takes 30 seconds</span>
          </div>
        </div>
        <div className="relative z-10">
          <SolarSystem />
        </div>
      </section>

      <section className="relative z-10 px-6 pb-20">
        <h2 className="mb-8 text-center font-serif text-3xl text-slate-200">Wisdom of the stars, in the words of the great</h2>
        <Quotes />
      </section>

      <CalculatorDirectory />
      <SiteFooter />
    </main>
  );
}
