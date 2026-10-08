import type { Metadata } from "next";
import Link from "next/link";
import { Starfield } from "@/components/Cosmos";
import BrandLogo from "@/components/BrandLogo";
import SiteFooter from "@/components/SiteFooter";
import { SITE_NAME, SITE_URL } from "@/lib/seo/catalog";

export const metadata: Metadata = {
  title: "Copyright, Ownership & All Rights Reserved",
  description:
    "Read Zodiac Veda’s full copyright notice: ownership of the brand, calculators, reports and software, permitted use, prohibited copying, astrology disclaimer and how to request permission.",
  alternates: { canonical: "/copyright" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Copyright & All Rights Reserved — Zodiac Veda",
  url: `${SITE_URL}/copyright`,
  isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  about: "Copyright, intellectual property and permitted use of Zodiac Veda",
};

export default function CopyrightPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Starfield count={40} />
      <nav className="relative z-10 mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
        <BrandLogo compact />
        <Link href="/" className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-amber-400">
          ← Home
        </Link>
      </nav>

      <article className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-4">
        <p className="label-caps !text-amber-300">Legal notice · Last updated 8 October 2026</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-slate-100 sm:text-6xl">
          Copyright &amp; all rights reserved
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-slate-300">
          This page is the official statement of ownership, reserved rights and permitted use for Zodiac Veda — including the website, calculators, birth-chart engine, reports, visual identity and written guidance. Please read it in full before copying, framing, scraping, republishing or commercially reusing any part of the service.
        </p>

        <div className="card mt-8 border-amber-400/20 p-6 sm:p-8">
          <p className="font-serif text-2xl text-amber-100">© 2026 Zodiac Veda. All rights reserved.</p>
          <p className="mt-3 text-slate-300">
            No part of this website or its software may be reproduced, distributed, transmitted, stored, adapted or used to train another product except as expressly allowed below or by written permission.
          </p>
        </div>

        <nav className="mt-10 rounded-2xl border border-slate-800 bg-slate-950/40 p-5 text-sm text-slate-300">
          <p className="label-caps mb-3 !text-amber-300">On this page</p>
          <ol className="grid gap-2 sm:grid-cols-2">
            {[
              ["#ownership", "1. Ownership of the work"],
              ["#reserved", "2. All rights reserved"],
              ["#protects", "3. What this copyright protects"],
              ["#use", "4. Permitted personal use"],
              ["#prohibited", "5. What you may not do"],
              ["#reports", "6. Charts, PDFs and saved reports"],
              ["#brand", "7. Name, logo and look"],
              ["#quotes", "8. Historical quotations"],
              ["#disclaimer", "9. Astrology & liability disclaimer"],
              ["#data", "10. Birth data you submit"],
              ["#third-party", "11. Third-party material"],
              ["#enforcement", "12. Enforcement"],
              ["#contact", "13. Permissions and notices"],
              ["#law", "14. Governing law"],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="hover:text-amber-200">
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <section id="ownership" className="mt-14 scroll-mt-8 space-y-4 text-slate-300">
          <h2 className="font-serif text-3xl text-slate-100">1. Ownership of the work</h2>
          <p>
            Zodiac Veda is an original digital work of Vedic astrology software and editorial presentation. The compilation of calculators, the arrangement of the public pages, the report layouts, the interpretive copy, the colour system, the astrolabe crest, the wordmark and the underlying calculation pipeline are owned by Zodiac Veda.
          </p>
          <p>
            “Work” on this site includes, without limitation: source code and compiled code; algorithms, rule tables and interpretive engines; user interfaces; database schemas; PDF templates; icons, illustrations and generated social images; page copy, FAQs, methodology notes and this legal text; and any translation, screenshot or derivative of the above.
          </p>
          <p>
            Unless a separate written licence is granted, visiting the site does not transfer any copyright, patent, design right, database right or trade-mark right to you. You receive only a limited, revocable, non-exclusive permission to use the public calculators as a personal visitor.
          </p>
        </section>

        <section id="reserved" className="mt-12 scroll-mt-8 space-y-4 text-slate-300">
          <h2 className="font-serif text-3xl text-slate-100">2. All rights reserved</h2>
          <p>
            The phrase <strong className="text-slate-100">All rights reserved</strong> is used here in its ordinary legal sense. Every right that the owner can reserve under applicable copyright and related-rights law is reserved, including the rights to:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>reproduce the work in any material form;</li>
            <li>issue copies of the work to the public;</li>
            <li>communicate the work to the public, including by making it available online;</li>
            <li>adapt, translate, abridge, rearrange or make a derivative work;</li>
            <li>perform, display, broadcast or include the work in another service;</li>
            <li>licence, assign, mortgage or otherwise deal with the work;</li>
            <li>authorise any other person to do any of the above.</li>
          </ul>
          <p>
            Silence on a particular use is not permission. If this page does not clearly allow an activity, you must treat that activity as reserved and ask first.
          </p>
        </section>

        <section id="protects" className="mt-12 scroll-mt-8 space-y-4 text-slate-300">
          <h2 className="font-serif text-3xl text-slate-100">3. What this copyright protects</h2>
          <p>Copyright protection on Zodiac Veda covers both the obvious and the easily overlooked:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong className="text-slate-100">The public website</strong> — homepage, calculator landing pages, result pages, this copyright article, metadata, structured data and sitemap presentation.
            </li>
            <li>
              <strong className="text-slate-100">The calculation layer</strong> — natal chart construction, whole-sign house assignment, Lahiri sidereal conversion, Vimshottari dasha timelines, Ashtakavarga tables, yoga and dosha detectors, matching rules, gemstone logic, varga charts and related reports.
            </li>
            <li>
              <strong className="text-slate-100">The written interpretations</strong> — house readings, planet notes, remedy language, FAQ answers, methodology explanations and PDF narrative sections.
            </li>
            <li>
              <strong className="text-slate-100">The visual system</strong> — the Zodiac Veda crest, gold dial, ZV monogram, typography pairing, night-sky layout, chart SVG frames and PDF colour bands.
            </li>
            <li>
              <strong className="text-slate-100">The product experience</strong> — the sequence of forms, saved-report URLs, PDF composition and the particular way results are grouped and titled.
            </li>
          </ul>
          <p>
            Classical Jyotisha ideas — signs, nakshatras, dashas, yogas — belong to a shared scholarly and cultural tradition. That tradition is not “owned” by this site. What is owned is <em>this implementation</em>: the code, the wording, the design and the particular combination of checks presented here.
          </p>
        </section>

        <section id="use" className="mt-12 scroll-mt-8 space-y-4 text-slate-300">
          <h2 className="font-serif text-3xl text-slate-100">4. Permitted personal use</h2>
          <p>You may, without a separate licence:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>open the public pages in a normal web browser for your own study;</li>
            <li>enter birth details to generate a chart or calculator report for yourself or for a person who asked you to do so;</li>
            <li>download the Kundli PDF that the site offers for that personal chart;</li>
            <li>keep a private copy of your own report for family or personal records;</li>
            <li>share a private saved-report link only with people who already have a right to see that birth information;</li>
            <li>quote a short extract of this copyright page or of a public FAQ, with credit and a link, in genuine commentary, review or news reporting of reasonable length.</li>
          </ul>
          <p>
            Personal use is not a commercial licence. Using Zodiac Veda as the hidden engine of a paid consultation business, a competing app, a white-label widget or a bulk lead-generation funnel requires written permission.
          </p>
        </section>

        <section id="prohibited" className="mt-12 scroll-mt-8 space-y-4 text-slate-300">
          <h2 className="font-serif text-3xl text-slate-100">5. What you may not do</h2>
          <p>Unless we have given prior written consent, you must not:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>copy, scrape, crawl at abusive volume, mirror or republish the site or its reports;</li>
            <li>clone the look, the calculator set, the PDF layout or the interpretive wording in another product;</li>
            <li>extract rule tables, yoga definitions, dosha logic or Ashtakavarga constants in order to rebuild them elsewhere;</li>
            <li>use the site, its outputs or its text to train a machine-learning model or to fine-tune an automated astrology assistant;</li>
            <li>frame the site inside another domain, overlay ads, or present Zodiac Veda as if it were your own service;</li>
            <li>remove, obscure or falsify copyright notices, brand marks, watermarks or this legal page;</li>
            <li>sell, rent, sublicence or bulk-distribute generated PDFs or API-style access;</li>
            <li>attempt to reverse engineer, decompile or circumvent technical limits except where a statute expressly allows it and cannot be waived;</li>
            <li>use automated tools to create thousands of charts for resale, spam or data harvesting;</li>
            <li>register confusingly similar names, domains or social handles in order to trade on Zodiac Veda’s identity.</li>
          </ul>
        </section>

        <section id="reports" className="mt-12 scroll-mt-8 space-y-4 text-slate-300">
          <h2 className="font-serif text-3xl text-slate-100">6. Charts, PDFs and saved reports</h2>
          <p>
            A generated Kundli, matching report or calculator result is a copyrighted compilation. The underlying astronomical positions of planets are facts of nature; the selection, arrangement, headings, commentary, colour, pagination and remedial language are original expression.
          </p>
          <p>
            Saved report URLs are unguessable tokens. They are not public catalogue pages. Do not post them on social media, forums, search engines or public résumés. Anyone with the link can open the report. Treat the link as you would treat a private document.
          </p>
          <p>
            Downloading a PDF does not make you the copyright owner of the template. You may keep and print your own chart. You may not strip the Zodiac Veda identification and rebrand the pages as a third-party “professional Kundli pack”.
          </p>
        </section>

        <section id="brand" className="mt-12 scroll-mt-8 space-y-4 text-slate-300">
          <h2 className="font-serif text-3xl text-slate-100">7. Name, logo and look</h2>
          <p>
            “Zodiac Veda”, the astrolabe crest, the ZV monogram, the gold-and-ivory wordmark and the tagline presentation are brand identifiers of this project. They must not be used on merchandise, consulting cards, YouTube thumbnails, app stores or other websites in a way that suggests sponsorship, partnership or authorship that does not exist.
          </p>
          <p>
            Fair identification is allowed: you may say that a chart was “generated with Zodiac Veda” in plain text, without reproducing the crest as your logo.
          </p>
        </section>

        <section id="quotes" className="mt-12 scroll-mt-8 space-y-4 text-slate-300">
          <h2 className="font-serif text-3xl text-slate-100">8. Historical quotations</h2>
          <p>
            The rotating lines on the homepage are well-known sayings associated with historical figures and are shown for cultural atmosphere. They are not legal advice, scientific proof of astrology, or claims that those persons endorsed this website. Short quotations of that kind are presented in good faith for commentary and mood. If you are the rights holder of a still-protected text and object to a particular line, write to the contact address below and it will be reviewed promptly.
          </p>
        </section>

        <section id="disclaimer" className="mt-12 scroll-mt-8 space-y-4 text-slate-300">
          <h2 className="font-serif text-3xl text-slate-100">9. Astrology and liability disclaimer</h2>
          <p>
            Jyotisha is a traditional interpretive system. Calculators on this site are educational tools. They are not medical, legal, financial, psychological or marital advice. They are not a certified court document, not a substitute for a qualified professional, and not a guarantee of any future event.
          </p>
          <p>
            Birth-time error, ayanamsa choice, house system, node convention and textual lineage can all change a result. Two sincere astrologers may disagree. You remain responsible for decisions about health, money, marriage, children, travel and career.
          </p>
          <p>
            To the fullest extent permitted by law, Zodiac Veda and its operators are not liable for loss, distress, delay or decision made in reliance on a chart, yoga, dosha, gemstone note, dasha period or matching score. If a jurisdiction does not allow limitation of implied warranties, those limits apply only to the extent the law allows.
          </p>
        </section>

        <section id="data" className="mt-12 scroll-mt-8 space-y-4 text-slate-300">
          <h2 className="font-serif text-3xl text-slate-100">10. Birth data you submit</h2>
          <p>
            Name, date, time, place and coordinates are supplied by you so that a chart can be calculated. Submit only information you have a right to use. Do not enter another adult’s details to harass, dox or publicly shame them. Do not enter a child’s data unless you are the parent or legal guardian and the use is genuine and private.
          </p>
          <p>
            Saved reports are intended as private working documents, not as a public directory of people. Do not attempt to enumerate, scrape or index report URLs.
          </p>
        </section>

        <section id="third-party" className="mt-12 scroll-mt-8 space-y-4 text-slate-300">
          <h2 className="font-serif text-3xl text-slate-100">11. Third-party material</h2>
          <p>
            Place lookup, fonts, libraries and hosting may involve third-party components distributed under their own licences. Those licences continue to apply to those components. Nothing on this page is an attempt to re-licence open-source libraries contrary to their terms. Classical Sanskrit names of signs, planets and yogas are part of the shared Jyotisha vocabulary.
          </p>
        </section>

        <section id="enforcement" className="mt-12 scroll-mt-8 space-y-4 text-slate-300">
          <h2 className="font-serif text-3xl text-slate-100">12. Enforcement</h2>
          <p>
            Unauthorised copying, scraping, impersonation or commercial reuse may be met with a request to stop, a takedown notice to the host or search engine, account or access restriction, and, where proportionate, legal remedies including injunctions and damages. We prefer a courteous first letter when the use looks accidental. Deliberate cloning will not be treated as accidental.
          </p>
          <p>
            If you believe content on this site infringes <em>your</em> copyright, send a notice with: your name and contact details; a description of the work; the exact URL; a statement of good-faith belief; and a signature. We will review it.
          </p>
        </section>

        <section id="contact" className="mt-12 scroll-mt-8 space-y-4 text-slate-300">
          <h2 className="font-serif text-3xl text-slate-100">13. Permissions and notices</h2>
          <p>
            For licensing, partnership, press quotation beyond fair comment, or to send a rights notice, write to:
          </p>
          <div className="card p-6">
            <p className="font-serif text-xl text-amber-100">Zodiac Veda</p>
            <p className="mt-2">Gachibowli, Hyderabad, Telangana 500032, India</p>
            <p className="mt-2">
              Email:{" "}
              <a className="text-amber-200 hover:underline" href="mailto:vasaanirudh444@gmail.com">
                vasaanirudh444@gmail.com
              </a>
            </p>
          </div>
          <p>
            Please put “Copyright permission” or “Copyright notice” in the subject line and allow a reasonable time for a human reply. Sending a request does not grant a licence until we confirm it in writing.
          </p>
        </section>

        <section id="law" className="mt-12 scroll-mt-8 space-y-4 text-slate-300">
          <h2 className="font-serif text-3xl text-slate-100">14. Governing law</h2>
          <p>
            This notice is intended to be read under the laws of India, including the Copyright Act, 1957 and the Copyright Rules, without prejudice to mandatory consumer protections that may apply where you live. Courts at Hyderabad, Telangana, shall be a convenient forum for disputes about the site’s intellectual property, subject to any non-excludable rights you have.
          </p>
          <p>
            If one sentence of this page is held unenforceable, the rest remains. The current version is the one published at this URL. We may update it as the service grows; the “last updated” date at the top is the marker.
          </p>
          <p className="font-serif text-2xl text-slate-100">
            © 2026 Zodiac Veda. All rights reserved.
          </p>
        </section>
      </article>

      <SiteFooter />
    </main>
  );
}
