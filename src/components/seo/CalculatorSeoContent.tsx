import Link from "next/link";
import { CALCULATOR_SEO, calculatorJsonLd, type SeoSlug } from "@/lib/seo/catalog";
import JsonLd from "./JsonLd";

export default function CalculatorSeoContent({ slug }: { slug: SeoSlug }) {
  const seo = CALCULATOR_SEO[slug];
  return (
    <>
      <JsonLd data={calculatorJsonLd(slug)} />
      <section aria-labelledby={`${slug}-guide`} className="relative z-10 mx-auto mt-12 max-w-5xl px-4 pb-10 sm:px-6">
        <div className="card p-6 sm:p-8">
          <p className="label-caps !text-amber-300">{slug === "western-horoscope" ? "Free Western astrology calculator guide" : "Free Vedic astrology calculator guide"}</p>
          <h2 id={`${slug}-guide`} className="mt-2 font-serif text-3xl font-semibold text-slate-100">About the {seo.name}</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">{seo.intro}</p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-serif text-xl font-semibold text-amber-200">What the report includes</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-300">
                {seo.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold text-amber-200">How to calculate it</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-300">
                {seo.steps.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </div>
          </div>
        </div>

        <div className="mt-5 card p-6 sm:p-8">
          <h2 className="font-serif text-3xl font-semibold text-slate-100">Frequently asked questions</h2>
          <div className="mt-4 divide-y divide-slate-700/50">
            {seo.faq.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="cursor-pointer list-none pr-8 font-semibold text-slate-100 marker:hidden">
                  <span className="flex items-center justify-between gap-4">{item.q}<span aria-hidden className="text-amber-300 transition group-open:rotate-45">+</span></span>
                </summary>
                <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-300">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        <nav aria-label="Related astrology calculators" className="mt-5 rounded-2xl border border-slate-700/60 bg-slate-900/30 p-5">
          <h2 className="font-serif text-xl font-semibold text-slate-100">{slug === "western-horoscope" ? "Related astrology calculators" : "Related Vedic astrology calculators"}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(CALCULATOR_SEO)
              .filter(([key]) => key !== slug)
              .slice(0, 6)
              .map(([key, item]) => (
                <Link key={key} href={item.path} className="rounded-full border border-slate-600 px-3 py-1.5 text-xs text-slate-300 transition hover:border-amber-400 hover:text-amber-200">
                  {item.shortName}
                </Link>
              ))}
          </div>
        </nav>
        <p className="mt-5 text-center text-xs leading-5 text-slate-500">Astrology is a traditional interpretive system. Calculator results are educational guidance and do not replace professional medical, legal, financial or psychological advice.</p>
      </section>
    </>
  );
}
