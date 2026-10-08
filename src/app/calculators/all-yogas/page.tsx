import Link from "next/link";
import { Starfield } from "@/components/Cosmos";
import SingleBirthForm from "@/components/calculators/SingleBirthForm";
import CalculatorSeoContent from "@/components/seo/CalculatorSeoContent";
import { calculatorMetadata } from "@/lib/seo/catalog";
import BrandLogo from "@/components/BrandLogo";

export const metadata = calculatorMetadata("all-yogas");

export default function AllYogasPage() {
  return (
    <main className="relative min-h-screen px-4 py-6 sm:px-6">
      <Starfield count={55} />
      <nav className="mx-auto mb-8 flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <BrandLogo compact />
        <Link href="/#calculators" className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-amber-400">← Calculators</Link>
      </nav>
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <span className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-amber-400/20 text-3xl">🔱</span>
          <p className="label-caps !text-amber-300">Calculator 02 · Classical combinations</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-slate-100 sm:text-5xl">All Yogas Calculator</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">Every classical yoga checked against your chart — which are present, how strong they are, when they activate and how to support them.</p>
        </header>
        <SingleBirthForm
          endpoint="/api/yogas"
          draftKey="jyotisha:all-yogas:draft-v1"
          submitLabel="Find my yogas →"
          busyLabel="Checking every yoga…"
          intro="Raja, Dhana, Pancha Mahapurusha, Chandra, Surya, Nabhasa and Arishta yogas are all evaluated on your real birth chart. Absent yogas are shown too, so you can see exactly what was checked."
        />
      </div>
      <CalculatorSeoContent slug="all-yogas" />
    </main>
  );
}
