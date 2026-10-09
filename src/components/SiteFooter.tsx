import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import Credit from "@/components/Credit";

export default function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-slate-800 bg-[#05040f]/80">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <BrandLogo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Free Vedic and Western horoscope calculators. Lahiri Kundli and tropical charts, explained in plain language.
          </p>
          <Credit className="mt-5 text-left" />
        </div>
        <div>
          <p className="label-caps !text-amber-300">Contact</p>
          <a
            href="mailto:zodiacveda111@gmail.com"
            className="mt-3 block text-sm text-amber-200 underline decoration-amber-400/40 underline-offset-4"
          >
            zodiacveda111@gmail.com
          </a>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Gachibowli, Hyderabad, 500032, India
          </p>
        </div>
        <div>
          <p className="label-caps !text-amber-300">On this site</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li><Link href="/build" className="hover:text-amber-200">Build your horoscope</Link></li>
            <li><Link href="/calculators/western-horoscope" className="hover:text-amber-200">Western horoscope</Link></li>
            <li><Link href="/calculators/jyotirlinga" className="hover:text-amber-200">Jyotirlingas</Link></li>
            <li><Link href="/calculators/marriage-matching" className="hover:text-amber-200">Marriage matching</Link></li>
            <li><Link href="/copyright" className="hover:text-amber-200">Copyrights</Link></li>
          </ul>
        </div>
      </div>
      <div className="space-y-2 border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-500">
        <p>
          Zodiac Veda · Sidereal zodiac, Lahiri ayanamsa · Astrology is a traditional system of interpretation; use predictions for guidance and reflection.
        </p>
        <p>
          <Link href="/copyright" className="font-medium text-amber-200/90 underline decoration-amber-400/40 underline-offset-4 hover:text-amber-100">
            Copyrights
          </Link>
          {" "}· © 2026 Zodiac Veda. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
