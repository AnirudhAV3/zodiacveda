import Link from "next/link";
import { Starfield } from "@/components/Cosmos";
import SingleBirthForm from "@/components/calculators/SingleBirthForm";
import CalculatorSeoContent from "@/components/seo/CalculatorSeoContent";
import { calculatorMetadata } from "@/lib/seo/catalog";
import BrandLogo from "@/components/BrandLogo";

export const metadata = calculatorMetadata("divisional-charts");

export default function DivisionalChartsPage() {
  return (
    <main className="relative min-h-screen px-4 py-6 sm:px-6">
      <Starfield count={55} />
      <nav className="mx-auto mb-8 flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <BrandLogo compact />
        <Link href="/#calculators" className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-amber-400">← Calculators</Link>
      </nav>
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <span className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/20 to-violet-500/20 text-3xl">📜</span>
          <p className="label-caps !text-amber-300">Calculator 06 · Shodashvarga</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-slate-100 sm:text-5xl">All Divisional Charts</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">All 16 vargas from D1 to D60 — drawn, explained, and scored with classical Vimsopaka strength.</p>
        </header>
        <SingleBirthForm
          endpoint="/api/divisional-charts"
          draftKey="jyotisha:divisional-charts:draft-v1"
          submitLabel="Generate all 16 charts →"
          busyLabel="Calculating 16 divisions…"
          intro="Each divisional chart refines one area of life — D9 for marriage, D10 for career, D7 for children, D60 for past-life karma. You get every chart drawn in your chosen style, what it is read for, which planets are strong in it, and your Vimsopaka strength across all four classical schemes."
        />
      </div>
      <CalculatorSeoContent slug="divisional-charts" /><footer className="mx-auto mt-12 max-w-5xl border-t border-slate-800 py-6"></footer>
    </main>
  );
}
