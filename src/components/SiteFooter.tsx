import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import Credit from "@/components/Credit";

const TOOLS = [
  { href: "/build", label: "Birth Chart" },
  { href: "/calculators/western-astrology", label: "Western Astrology" },
  { href: "/calculators/marriage-matching", label: "Kundli Matching" },
  { href: "/calculators/all-yogas", label: "Yogas" },
  { href: "/calculators/all-doshas", label: "Doshas" },
  { href: "/calculators/gemstones", label: "Gemstones" },
  { href: "/calculators/divisional-charts", label: "Divisional Charts" },
  { href: "/calculators/nakshatra-rashi", label: "Nakshatra" },
  { href: "/calculators/vimshottari-dasha", label: "Vimshottari Dasha" },
  { href: "/calculators/kaal-sarp", label: "Kaal Sarp" },
  { href: "/calculators/mangal-dosha", label: "Mangal Dosha" },
  { href: "/calculators/sade-sati", label: "Sade Sati" },
];

export default function SiteFooter({ note }: { note?: string }) {
  return (
    <footer className="relative z-10 border-t border-amber-400/15 bg-[#07071a]/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <BrandLogo />
          <Credit className="mt-5 text-left sm:text-left" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Sidereal Vedic astrology, Lahiri ayanamsa, calculated with care for guidance and reflection — never as a substitute for your own judgement.
          </p>
        </div>

        <div>
          <p className="label-caps !text-amber-300">Calculators</p>
          <ul className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-300 sm:grid-cols-2 lg:grid-cols-1">
            {TOOLS.map((tool) => (
              <li key={tool.href}>
                <Link href={tool.href} className="transition hover:text-amber-200">
                  {tool.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="label-caps !text-amber-300">Legal</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>
              <Link href="/copyright" className="transition hover:text-amber-200">
                Copyright &amp; rights
              </Link>
            </li>
            <li>
              <Link href="/copyright#use" className="transition hover:text-amber-200">
                Permitted use
              </Link>
            </li>
            <li>
              <Link href="/copyright#disclaimer" className="transition hover:text-amber-200">
                Astrology disclaimer
              </Link>
            </li>
            <li>
              <Link href="/copyright#contact" className="transition hover:text-amber-200">
                Permissions &amp; notices
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="label-caps !text-amber-300">Contact</p>
          <address className="mt-4 not-italic text-sm leading-relaxed text-slate-300">
            <p className="font-medium text-slate-100">Zodiac Veda</p>
            <p className="mt-2">Gachibowli</p>
            <p>Hyderabad, Telangana 500032</p>
            <p>India</p>
            <p className="mt-4">
              <a href="mailto:vasaanirudh444@gmail.com" className="text-amber-200 transition hover:text-amber-100">
                vasaanirudh444@gmail.com
              </a>
            </p>
          </address>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-6 py-5 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p className="flex flex-wrap items-center gap-3">
            <Link href="/copyright" className="font-medium text-slate-300 underline-offset-4 transition hover:text-amber-200 hover:underline">
              © 2026 Zodiac Veda. All rights reserved.
            </Link>
            <Link
              href="/copyright"
              className="rounded-full border border-amber-400/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200 transition hover:bg-amber-400/10"
            >
              Copyright
            </Link>
          </p>
          <p className="max-w-xl sm:text-right">{note || "Astrology is a traditional system of interpretation. Use predictions for guidance, not as destiny."}</p>
        </div>
      </div>
    </footer>
  );
}
