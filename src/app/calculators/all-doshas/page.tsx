import Link from "next/link";
import { Starfield } from "@/components/Cosmos";
import SingleBirthForm from "@/components/calculators/SingleBirthForm";
import CalculatorSeoContent from "@/components/seo/CalculatorSeoContent";
import { calculatorMetadata } from "@/lib/seo/catalog";
import BrandLogo from "@/components/BrandLogo";

export const metadata = calculatorMetadata("all-doshas");

export default function AllDoshasPage() {
  return (
    <main className="relative min-h-screen px-4 py-6 sm:px-6">
      <Starfield count={55} />
      <nav className="mx-auto mb-8 flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <BrandLogo compact />
        <Link href="/#calculators" className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-amber-400">← Calculators</Link>
      </nav>
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <span className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-amber-400/20 text-3xl">🛡</span>
          <p className="label-caps !text-amber-300">Calculator 04 · Afflictions &amp; remedies</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-slate-100 sm:text-5xl">All Doshas Calculator</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">Every classical affliction checked on your chart — which apply, how strong they are, which are cancelled, and what actually helps.</p>
        </header>
        <SingleBirthForm
          endpoint="/api/doshas"
          draftKey="jyotisha:all-doshas:draft-v1"
          submitLabel="Check my doshas →"
          busyLabel="Checking every dosha…"
          intro="Mangal (Kuja), Kaal Sarp, Pitra, Grahan, Guru Chandal, Kemadruma, Shrapit and Angarak doshas are all evaluated, plus your current Sade Sati phase with real Saturn transit dates. Cancellations are shown openly, and doshas you do not have are listed too."
        />
      </div>
      <CalculatorSeoContent slug="all-doshas" />
    </main>
  );
}
