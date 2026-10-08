import Link from "next/link";
import Credit from "@/components/Credit";

export default function SiteFooter() {
  return (
    <footer className="relative z-10 space-y-2 border-t border-slate-800 bg-[#05040f]/70 px-6 py-6 text-center text-xs text-slate-500">
      <Credit className="mb-1" />
      <p>
        Zodiac Veda · Sidereal zodiac, Lahiri ayanamsa · Astrology is a traditional system of interpretation; use predictions for guidance and reflection.
      </p>
      <p>
        <Link href="/copyright" className="underline decoration-slate-600 underline-offset-4 transition hover:text-amber-300">
          Copyright
        </Link>
        {" "}© 2026 Zodiac Veda. All rights reserved.
      </p>
    </footer>
  );
}
