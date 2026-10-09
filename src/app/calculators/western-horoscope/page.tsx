import Link from "next/link";
import { Starfield } from "@/components/Cosmos";
import SingleBirthForm from "@/components/calculators/SingleBirthForm";
import CalculatorSeoContent from "@/components/seo/CalculatorSeoContent";
import { calculatorMetadata } from "@/lib/seo/catalog";
import BrandLogo from "@/components/BrandLogo";

export const metadata = calculatorMetadata("western-horoscope");

export default function WesternHoroscopePage() {
  return (
    <main className="relative min-h-screen px-4 py-6 sm:px-6">
      <Starfield count={55} />
      <nav className="relative z-10 mx-auto mb-8 flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <BrandLogo compact />
        <Link href="/#calculators" className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-amber-400">← Calculators</Link>
      </nav>
      <div className="relative z-10 mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <span className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400/20 to-pink-500/20 text-3xl">☉</span>
          <p className="label-caps !text-amber-300">Calculator 13 · Tropical Zodiac</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-slate-100 sm:text-5xl">Western Horoscope Calculator</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">Explore your tropical Sun, Moon and Rising signs, planetary houses and major aspects from your recorded birth details.</p>
        </header>
        <SingleBirthForm
          endpoint="/api/western-horoscope"
          draftKey="jyotisha:western-horoscope:draft-v1"
          submitLabel="Cast my Western chart →"
          busyLabel="Calculating planetary positions…"
          intro="This calculator uses the tropical zodiac and equal-sign houses. Accurate local birth time and place matter for the Rising sign and houses. Interpretations are for reflection, not certainty."
          birthDetailsSubtitle="Accurate local birth time and place determine the tropical Rising sign and equal-sign houses."
          showStyle={false}
        />
      </div>
      <CalculatorSeoContent slug="western-horoscope" />
    </main>
  );
}
