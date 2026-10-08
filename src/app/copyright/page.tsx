import type { Metadata } from "next";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

export const metadata: Metadata = {
  title: "Copyright Notice",
  description: "Copyright notice for Zodiac Veda.",
  alternates: { canonical: "/copyright" },
};

export default function CopyrightPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <nav className="mb-12 flex items-center justify-between gap-4">
          <BrandLogo compact />
          <Link href="/" className="rounded-full border border-amber-400/40 px-4 py-2 text-sm text-amber-200 transition hover:bg-amber-400/10">
            Back to home
          </Link>
        </nav>

        <article className="card space-y-6 p-6 sm:p-10">
          <p className="label-caps !text-amber-300">Legal notice</p>
          <h1 className="font-serif text-4xl font-semibold text-slate-100 sm:text-5xl">Copyright notice</h1>
          <p className="text-lg leading-8 text-slate-300">
            Copyright © 2026 Zodiac Veda. All rights reserved.
          </p>
          <p className="leading-7 text-slate-300">
            Unless otherwise stated, the original design, software, written material, illustrations, and other content published on this website are protected by applicable copyright laws. You may not copy, reproduce, republish, distribute, or adapt this material without prior written permission from the rights holder.
          </p>
          <p className="leading-7 text-slate-300">
            Astrology information and reports are provided for educational and personal-reflection purposes. They are not a substitute for professional advice.
          </p>
          <p className="text-sm text-slate-400">
            Third-party names, marks, and materials remain the property of their respective owners.
          </p>
        </article>
      </div>
    </main>
  );
}
