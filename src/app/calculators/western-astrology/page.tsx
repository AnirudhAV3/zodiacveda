import Link from "next/link";
import { Starfield } from "@/components/Cosmos";
import SingleBirthForm from "@/components/calculators/SingleBirthForm";
import CalculatorSeoContent from "@/components/seo/CalculatorSeoContent";
import { calculatorMetadata } from "@/lib/seo/catalog";
import BrandLogo from "@/components/BrandLogo";

export const metadata = calculatorMetadata("western-astrology");

export default function WesternAstrologyPage() {
  return (
    <main className="relative min-h-screen px-4 py-6 sm:px-6">
      <Starfield count={55} />
      <nav className="mx-auto mb-8 flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <BrandLogo compact />
        <Link href="/#calculators" className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-amber-400">← Calculators</Link>
      </nav>
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <span className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-violet-400/20 text-3xl">☉</span>
          <p className="label-caps !text-sky-300">Calculator 02 · Tropical natal chart</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-slate-100 sm:text-5xl">Western Birth Chart Calculator</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            A full Western nativity: tropical Sun, Moon and Rising, Porphyry houses, planets through Pluto, aspects, patterns, life-area readings, transits and secondary progressions.
          </p>
        </header>
        <SingleBirthForm
          endpoint="/api/western"
          draftKey="jyotisha:western-astrology:draft-v1"
          submitLabel="Cast my Western chart →"
          busyLabel="Computing tropical positions…"
          intro="This calculator is Western, not Vedic. It uses the tropical zodiac (seasons), Porphyry houses, modern outer planets and aspect patterns. Your Vedic Kundli on this site remains a separate, Lahiri-sidereal engine."
          showStyle={false}
        />
      </div>
      <CalculatorSeoContent slug="western-astrology" />
    </main>
  );
}
