import Link from "next/link";
import { Starfield } from "@/components/Cosmos";
import SingleBirthForm from "@/components/calculators/SingleBirthForm";
import CalculatorSeoContent from "@/components/seo/CalculatorSeoContent";
import { calculatorMetadata } from "@/lib/seo/catalog";
import BrandLogo from "@/components/BrandLogo";

export const metadata = calculatorMetadata("gemstones");

export default function GemstonePage() {
  return (
    <main className="relative min-h-screen px-4 py-6 sm:px-6">
      <Starfield count={55} />
      <nav className="mx-auto mb-8 flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <BrandLogo compact />
        <Link href="/#calculators" className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-amber-400">← Calculators</Link>
      </nav>
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <span className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-emerald-400/20 text-3xl">💎</span>
          <p className="label-caps !text-amber-300">Calculator 05 · Ratna selection</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-slate-100 sm:text-5xl">Gemstone Calculator</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">Which stones suit your chart, which to avoid and why, affordable substitutes, and the exact weight, metal, finger, day and mantra.</p>
        </header>
        <SingleBirthForm
          endpoint="/api/gemstones"
          draftKey="jyotisha:gemstones:draft-v1"
          submitLabel="Find my gemstones →"
          busyLabel="Analysing your chart…"
          intro="Stones are selected by house lordship and functional nature — the classical method. You get your Life, Fortune and Prosperity stones, a clear list of stones to avoid with reasons, lower-cost substitutes to test first, and full wearing instructions."
          showStyle={false}
        />
      </div>
      <CalculatorSeoContent slug="gemstones" />
    </main>
  );
}
