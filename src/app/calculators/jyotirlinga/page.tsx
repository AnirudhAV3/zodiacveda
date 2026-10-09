import Link from "next/link";
import { Starfield } from "@/components/Cosmos";
import SingleBirthForm from "@/components/calculators/SingleBirthForm";
import CalculatorSeoContent from "@/components/seo/CalculatorSeoContent";
import { calculatorMetadata } from "@/lib/seo/catalog";
import BrandLogo from "@/components/BrandLogo";

export const metadata = calculatorMetadata("jyotirlinga");

export default function JyotirlingaPage() {
  return (
    <main className="relative min-h-screen px-4 py-6 sm:px-6">
      <Starfield count={55} />
      <nav className="relative z-10 mx-auto mb-8 flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <BrandLogo compact />
        <Link href="/#calculators" className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-amber-400">← Calculators</Link>
      </nav>
      <div className="relative z-10 mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <span className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 text-3xl">🕉</span>
          <p className="label-caps !text-amber-300">Calculator 12 · Jyotirlinga Yatra</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-slate-100 sm:text-5xl">Jyotirlingas to Visit</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">Find six traditional shrine suggestions from your Moon sign and ascendant: one for strength, one for obstacles and one for fortune from each reference.</p>
        </header>
        <SingleBirthForm
          endpoint="/api/jyotirlinga"
          draftKey="jyotisha:jyotirlinga:draft-v1"
          submitLabel="Find my Jyotirlingas →"
          busyLabel="Calculating your chart…"
          intro="The report counts the 1st, 6th and 9th signs from your Janma Rashi and Lagna and maps each to a Jyotirlinga. This is a traditional spiritual reflection, not a prediction or a substitute for practical advice."
          birthDetailsSubtitle="Accurate birth time and birthplace determine the Moon sign and Lagna used in the report."
          showStyle={false}
        />
      </div>
      <CalculatorSeoContent slug="jyotirlinga" />
    </main>
  );
}
