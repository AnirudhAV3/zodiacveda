import type { Metadata } from "next";
import Link from "next/link";
import { FloatingGlyphs, SolarSystem, Starfield } from "@/components/Cosmos";
import Quotes from "@/components/Quotes";
import Credit from "@/components/Credit";
import CalculatorDirectory from "@/components/calculators/CalculatorDirectory";
import HomeCalculatorButton from "@/components/HomeCalculatorButton";
import HomeStructuredData from "@/components/seo/HomeStructuredData";
import BrandLogo from "@/components/BrandLogo";


export const metadata: Metadata = {
  title: "Free Vedic Astrology Calculators & Kundli Online",
  description: "Use 11 free Vedic astrology calculators for Kundli, matching, yogas, doshas, gemstones, divisional charts, Nakshatra and Dasha. Download your full birth-chart PDF free.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <HomeStructuredData />
      <Starfield />
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <BrandLogo compact />
        <HomeCalculatorButton className="rounded-full border border-amber-400/40 px-5 py-2 text-sm text-amber-200 transition hover:bg-amber-400/10">
          Build Chart
        </HomeCalculatorButton>
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
            <HomeCalculatorButton className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 px-9 py-4 text-lg font-semibold text-slate-950 shadow-[0_10px_40px_rgba(249,115,22,0.45)] transition hover:scale-[1.03]">
              <span className="glyph text-xl">✦</span> Build Chart
              <span className="transition group-hover:translate-x-1">→</span>
            </HomeCalculatorButton>
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
      <footer className="relative z-10 space-y-2 border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <Credit className="mb-1" />
        Zodiac Veda · Sidereal zodiac, Lahiri ayanamsa · Astrology is a traditional system of interpretation; use predictions for guidance and reflection.
      </footer>
    </main>
  );
}
