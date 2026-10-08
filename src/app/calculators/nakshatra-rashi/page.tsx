import Link from "next/link";
import { Starfield } from "@/components/Cosmos";
import SingleBirthForm from "@/components/calculators/SingleBirthForm";
import CalculatorSeoContent from "@/components/seo/CalculatorSeoContent";
import { calculatorMetadata } from "@/lib/seo/catalog";
import BrandLogo from "@/components/BrandLogo";

export const metadata = calculatorMetadata("nakshatra-rashi");

export default function NakshatraRashiPage() {
  return (
    <main className="relative min-h-screen px-4 py-6 sm:px-6">
      <Starfield count={55} />
      <nav className="mx-auto mb-8 flex max-w-5xl flex-wrap items-center justify-between gap-3"><BrandLogo compact /><Link href="/#calculators" className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-amber-400">← Calculators</Link></nav>
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center"><span className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-violet-500/20 text-3xl">⭐</span><p className="label-caps !text-amber-300">Calculator 07 · Janma Nakshatra</p><h1 className="mt-2 font-serif text-4xl font-semibold text-slate-100 sm:text-5xl">Nakshatra &amp; Rashi Calculator</h1><p className="mx-auto mt-3 max-w-2xl text-slate-400">Your exact Moon sign, birth star and pada — with Avakhada, Panchang, all four padas, Tara Chakra, lucky factors and a personalised interpretation.</p></header>
        <SingleBirthForm endpoint="/api/nakshatra-rashi" draftKey="jyotisha:nakshatra-rashi:draft-v1" submitLabel="Find my Nakshatra →" busyLabel="Calculating Moon position…" intro="This calculator uses the exact sidereal Moon longitude at your recorded birth time — not just the date. It calculates the 13°20′ nakshatra span, 3°20′ pada, Moon sign, birth syllable and traditional classifications." showStyle={false} />
      </div>
      <CalculatorSeoContent slug="nakshatra-rashi" />
    </main>
  );
}
