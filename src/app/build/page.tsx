import Link from "next/link";
import { Starfield } from "@/components/Cosmos";
import BirthForm from "@/components/BirthForm";
import CalculatorSeoContent from "@/components/seo/CalculatorSeoContent";
import { calculatorMetadata } from "@/lib/seo/catalog";
import BrandLogo from "@/components/BrandLogo";

export const metadata = calculatorMetadata("birth-horoscope");

export default function BuildHoroscopePage() {
  return (
    <main className="relative min-h-screen">
      <Starfield count={55} />
      <nav className="relative z-10 mx-auto mb-8 flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 pt-6 sm:px-6">
        <BrandLogo compact />
        <Link href="/#calculators" className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-amber-400">
          ← Calculators
        </Link>
      </nav>
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <header className="mb-8 text-center">
          <span className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-pink-500/20 text-3xl">🪐</span>
          <p className="label-caps !text-amber-300">Calculator 01 · Janma Kundli</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-slate-100 sm:text-5xl">Vedic Birth Chart Calculator</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            Generate your complete Kundli with D1, D9 and D10 charts, dashas, yogas, doshas, strengths, predictions and a free multi-page PDF.
          </p>
        </header>
        <BirthForm />
      </div>
      <CalculatorSeoContent slug="birth-horoscope" />
    </main>
  );
}
