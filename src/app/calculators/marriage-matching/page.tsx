import Link from "next/link";
import { Starfield } from "@/components/Cosmos";
import MatchingForm from "@/components/calculators/MatchingForm";
import CalculatorSeoContent from "@/components/seo/CalculatorSeoContent";
import { calculatorMetadata } from "@/lib/seo/catalog";
import BrandLogo from "@/components/BrandLogo";

export const metadata = calculatorMetadata("marriage-matching");

export default function MatchingPage() {
  return (
    <main className="relative min-h-screen px-4 py-6 sm:px-6">
      <Starfield count={55} />
      <nav className="mx-auto mb-8 flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <BrandLogo compact />
        <Link href="/#calculators" className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-amber-400">← Calculators</Link>
      </nav>
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 text-center">
          <span className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-pink-500/20 text-3xl">💞</span>
          <p className="label-caps !text-amber-300">Calculator 01 · Ashtakoota / Guna Milan</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-slate-100 sm:text-5xl">Marriage Horoscope Matching</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">Two birth charts. Eight compatibility factors. A clear, saved report that explains every point and every flag.</p>
        </header>
        <MatchingForm />
      </div>
      <CalculatorSeoContent slug="marriage-matching" />
    </main>
  );
}
