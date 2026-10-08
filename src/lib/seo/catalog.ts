import type { Metadata } from "next";

export const SITE_NAME = "Zodiac Veda";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://zodiacveda.netlify.app").replace(/\/$/, "");
export const SEO_UPDATED = "2026-10-04";

export type SeoSlug = keyof typeof CALCULATOR_SEO;
export interface CalculatorSeo {
  name: string;
  shortName: string;
  path: string;
  title: string;
  description: string;
  keywords: string[];
  intro: string;
  features: string[];
  steps: string[];
  faq: { q: string; a: string }[];
}

export const CALCULATOR_SEO = {
  "birth-horoscope": {
    name: "Vedic Birth Chart & Kundli Calculator",
    shortName: "Build Your Horoscope",
    path: "/build",
    title: "Free Vedic Birth Chart Calculator – Kundli, D1, D9 & D10",
    description: "Generate a free Vedic Kundli with Lahiri D1, D9 and D10 charts, Dashas, yogas, doshas, Shadbala, predictions and a downloadable full PDF report.",
    keywords: ["Vedic birth chart calculator", "Kundli calculator", "free horoscope calculator", "Janma Kundali", "D1 chart", "D9 Navamsa chart", "D10 Dasamsa chart", "Lahiri ayanamsa", "Vedic astrology chart"],
    intro: "Build a complete Vedic birth horoscope from your exact date, 24-hour birth time and place. The calculator uses the Lahiri sidereal zodiac and produces North or South Indian charts with detailed timing and interpretation.",
    features: ["D1 Rashi, D9 Navamsa and D10 Dasamsa charts", "Clickable houses with sign, planet and nakshatra details", "Mahadasha, Antardasha and Pratyantar Vimshottari timeline", "Planetary strength, Shadbala, yogas, doshas and remedies", "Free traditional multi-page Kundli PDF download"],
    steps: ["Enter the recorded birth date and exact 24-hour time.", "Select the birth city so coordinates and time zone are correct.", "Choose North or South Indian chart style and generate the Kundli."],
    faq: [
      { q: "Is this Vedic birth chart calculator free?", a: "Yes. You can calculate your horoscope, view your chart and download the detailed printable PDF without creating an account or paying." },
      { q: "Which ayanamsa does the Kundli use?", a: "Zodiac Veda uses Lahiri (Chitrapaksha) sidereal ayanamsa and whole-sign houses." },
      { q: "How accurate must my birth time be?", a: "Use the recorded birth time whenever possible. Divisional charts and the ascendant can change when the time changes by only a few minutes." },
    ],
  },
  "marriage-matching": {
    name: "Kundli Matching & Marriage Horoscope Matching Calculator",
    shortName: "Marriage Horoscope Matching",
    path: "/calculators/marriage-matching",
    title: "Free Kundli Matching Calculator – 36 Guna Milan & Manglik Check",
    description: "Match two horoscopes with free 36-point Ashtakoota Guna Milan, Manglik Dosha, Nadi, Bhakoot, D1/D9 charts, marriage indicators and remedies.",
    keywords: ["Kundli matching calculator", "marriage horoscope matching", "Guna Milan calculator", "36 guna matching", "Ashtakoota matching", "Manglik matching", "horoscope compatibility", "Kundali Milan"],
    intro: "Compare two complete birth charts for traditional North Indian Ashtakoota marriage matching. Every point is explained, and the report adds Manglik balance, Nadi and Bhakoot review, D1/D9 charts and marriage indicators.",
    features: ["Varna, Vashya, Tara, Yoni, Maitri, Gana, Bhakoot and Nadi", "Transparent raw score out of 36", "Manglik comparison from Lagna, Moon and Venus", "Both D1 and D9 charts with clickable houses", "Saved compatibility report and individual horoscope links"],
    steps: ["Enter accurate birth details for Person 1.", "Enter accurate birth details for Person 2.", "Calculate and open the saved compatibility report."],
    faq: [
      { q: "How many Gunas should match for marriage?", a: "A raw score of 18 out of 36 is commonly treated as the traditional threshold, but the complete charts, dosha cancellations and real-life compatibility also matter." },
      { q: "Does a low Guna score mean the marriage will fail?", a: "No. Guna Milan is a traditional symbolic method, not a scientific probability or guarantee. The detailed factors and both full horoscopes should be reviewed." },
      { q: "Does this calculator check Manglik Dosha?", a: "Yes. It compares Mars from Lagna, Moon and Venus in both charts and displays the shared engine's cancellation rules." },
    ],
  },
  "all-yogas": {
    name: "All Vedic Astrology Yogas Calculator",
    shortName: "All Yogas",
    path: "/calculators/all-yogas",
    title: "All Yogas Calculator – Check 125 Vedic Yogas in Your Kundli",
    description: "Check 125 classical Vedic astrology yogas in your birth chart, including Raja, Dhana, Mahapurusha, Chandra and Nabhasa yogas, with strength, timing and remedies.",
    keywords: ["Yoga calculator astrology", "Vedic yoga calculator", "Raja Yoga calculator", "Dhana Yoga calculator", "Mahapurusha Yoga", "Kundli yogas", "astrology yogas list", "birth chart yoga checker"],
    intro: "Evaluate every classical yoga definition supported by Zodiac Veda rather than showing only favourable combinations. Present and absent yogas are listed with formation, planetary strength, activation periods and optional remedies.",
    features: ["125 yoga definitions checked", "Present and absent combinations disclosed", "Raja, Dhana, Pancha Mahapurusha, Chandra and Nabhasa categories", "Planet strength and Dasha activation periods", "Search, category filters and remedy plan"],
    steps: ["Enter exact birth details.", "The engine builds your chart and checks every yoga rule.", "Filter the saved report by category or search for a yoga name."],
    faq: [
      { q: "What is a Yoga in Vedic astrology?", a: "A Yoga is a defined planetary combination or house-lord relationship traditionally associated with a particular potential or challenge." },
      { q: "Does having a Raja Yoga guarantee success?", a: "No. A yoga shows potential. Its planets' strength, Dasha timing, the rest of the chart and personal effort affect how it manifests." },
      { q: "Why does another astrology app show different yogas?", a: "Classical texts and modern lineages use different definitions and cancellation rules. This calculator lists its formation rule for every result." },
    ],
  },
  "all-doshas": {
    name: "All Vedic Doshas Calculator",
    shortName: "All Doshas",
    path: "/calculators/all-doshas",
    title: "All Doshas Calculator – Mangal, Kaal Sarp, Pitra & Sade Sati",
    description: "Check Mangal, Kaal Sarp, Pitra, Grahan, Guru Chandal, Kemadruma, Shrapit and Angarak Doshas plus Sade Sati, cancellations and remedies.",
    keywords: ["Dosha calculator", "all doshas in Kundli", "Mangal Dosha check", "Kaal Sarp Dosha check", "Pitra Dosha calculator", "Grahan Dosha", "Sade Sati calculator", "Kundli dosha"],
    intro: "Run a transparent review of nine major Vedic astrology afflictions. The report distinguishes active, cancelled or reduced and absent doshas, and includes a dated Sade Sati timeline.",
    features: ["Nine dosha checks", "Severity and life areas", "Classical cancellations shown explicitly", "Live Saturn transit and Sade Sati dates", "Low-cost mantra, charity and lifestyle guidance"],
    steps: ["Enter birth date, exact time and place.", "The engine checks natal doshas and current Saturn transit.", "Open each result to see evidence, cancellation and remedies."],
    faq: [
      { q: "Can a Dosha be cancelled?", a: "Many traditions describe cancellation or mitigation conditions. Zodiac Veda displays a cancellation instead of silently hiding the underlying placement." },
      { q: "Does every horoscope contain a Dosha?", a: "No, but one or more traditional flags are common. A dosha is not fixed fate, and a complete chart matters more than one label." },
      { q: "Are expensive Dosha remedies necessary?", a: "No. The report begins with optional mantra, charity and practical conduct and warns against fear-based expensive remedies." },
    ],
  },
  gemstones: {
    name: "Vedic Astrology Gemstone Calculator",
    shortName: "Gemstone Calculator",
    path: "/calculators/gemstones",
    title: "Gemstone Calculator by Date of Birth – Vedic Astrology Stones",
    description: "Find gemstones recommended for your Vedic birth chart, stones to avoid, substitutes, weight, metal, finger, weekday, mantra and traditional wearing instructions.",
    keywords: ["Gemstone calculator", "astrology gemstone calculator", "gemstone by date of birth", "lucky stone calculator", "Vedic gemstone", "Pukhraj calculator", "Ruby astrology", "which gemstone should I wear"],
    intro: "Select gemstones from ascendant-based house lordship and functional nature—not from birth month alone. The report gives safe primary stones, optional stones, an avoid list and budget substitutes.",
    features: ["Life, fortune and prosperity stones", "All nine planetary stones reviewed", "Explicit avoid list with reasons", "Ratti/carat, metal, finger, day, time and mantra", "Lower-cost traditional substitutes"],
    steps: ["Enter exact birth details.", "The engine evaluates each planet's functional role and strength.", "Review recommended and avoided stones before purchasing anything."],
    faq: [
      { q: "Which gemstone should I wear according to Vedic astrology?", a: "Classically, gemstones are chosen primarily from ascendant house lordship. This calculator recommends the Lagna, ninth and fifth lord stones when appropriate." },
      { q: "Can I wear a stone for a weak planet?", a: "Not automatically. Strengthening a functional malefic can amplify its difficult houses. The calculator checks functional nature before recommending a stone." },
      { q: "Should I buy an expensive gemstone immediately?", a: "No. Try a certified lower-cost substitute and seek a second opinion, especially for Blue Sapphire, Hessonite or a debilitated planet." },
    ],
  },
  "divisional-charts": {
    name: "All Divisional Charts & Shodashvarga Calculator",
    shortName: "All Divisional Charts",
    path: "/calculators/divisional-charts",
    title: "Divisional Charts Calculator – D1 to D60 Shodashvarga Charts",
    description: "Generate all 16 Vedic divisional charts from D1 to D60 with North or South Indian layouts, Vargottama planets and Vimsopaka strength.",
    keywords: ["Divisional charts calculator", "Shodashvarga calculator", "D9 chart calculator", "Navamsa calculator", "D10 Dasamsa calculator", "D60 chart", "Vimsopaka Bala", "Vedic astrology varga charts"],
    intro: "Generate the full Shodashvarga set from your exact birth time. Every division is drawn and explained, with per-chart dignity, Vargottama placements and Vimsopaka strength.",
    features: ["D1, D2, D3, D4, D7, D9, D10 and D12", "D16, D20, D24, D27, D30, D40, D45 and D60", "North and South Indian layouts", "Vargottama planet detection", "Four Vimsopaka strength schemes"],
    steps: ["Enter a verified birth time and place.", "Choose North or South Indian drawing style.", "Explore all 16 saved charts and strength tables."],
    faq: [
      { q: "What is the most important divisional chart?", a: "D9 Navamsa is generally treated as the most important after D1, while D10 is used for career and D7 for children." },
      { q: "Why does D60 change when birth time changes slightly?", a: "D60 divides each sign into half-degree portions, so it is extremely sensitive to birth-time accuracy." },
      { q: "What is Vargottama?", a: "A planet is Vargottama when it occupies the same sign in D1 and a divisional chart, traditionally strengthening its expression." },
    ],
  },
  "kaal-sarp": {
    name: "Kaal Sarp Dosha Calculator",
    shortName: "Kaal Sarp Dosha",
    path: "/calculators/kaal-sarp",
    title: "Kaal Sarp Dosha Calculator – Check Type, Axis & Remedies",
    description: "Check Kaal Sarp Dosha from your Kundli: full or partial enclosure, all 12 types, Rahu-Ketu axis, planets outside, affected houses and remedies.",
    keywords: ["Kaal Sarp Dosha calculator", "Kala Sarpa Yoga calculator", "Kaal Sarp check", "Kaal Sarp types", "Anant Kaal Sarp", "Rahu Ketu axis", "Kaal Sarp remedies", "Kundli Kaal Sarp"],
    intro: "Audit the Rahu–Ketu axis rather than relying on a generic label. The calculator tests all seven classical planets, identifies full or partial enclosure and names the type from Rahu's house.",
    features: ["Full versus partial Kaal Sarp", "All 12 classical type names", "Planet order and distance from nodes", "Planets outside the axis", "Affected houses, supportive context and remedies"],
    steps: ["Enter exact birth details.", "The engine places the seven classical planets around the node axis.", "Review enclosure direction, type and mitigating factors."],
    faq: [
      { q: "How is Kaal Sarp Dosha calculated?", a: "Full Kaal Sarp is reported when all seven classical planets lie inside one open semicircle between Rahu and Ketu. The nodes themselves are not counted among the seven." },
      { q: "What is partial Kaal Sarp?", a: "Zodiac Veda labels a six-of-seven enclosure as partial. It does not present it as the same as a full Kaal Sarp Dosha." },
      { q: "Can Kaal Sarp be cancelled?", a: "There is no universally accepted cancellation formula. The report shows supportive chart factors separately without changing the raw result." },
    ],
  },
  "mangal-dosha": {
    name: "Kuja Dosha & Mangal Dosha Calculator",
    shortName: "Kuja / Mangal Dosha",
    path: "/calculators/mangal-dosha",
    title: "Kuja Dosha Calculator – Free Mangal Dosha & Manglik Check",
    description: "Free Kuja Dosha and Mangal Dosha calculator: check Mars from Lagna, Moon and Venus, Manglik houses, cancellations, intensity, Navamsa and marriage context.",
    keywords: ["Kuja Dosha calculator", "Mangal Dosha calculator", "Manglik calculator", "Kuja dosham check", "Mangal dosh check by date of birth", "Manglik houses", "Mangal Dosha cancellation", "Mars Dosha calculator"],
    intro: "Check Mars from the Lagna, Moon and Venus using the six-house convention, then review cancellation rules, Mars strength, Navamsa and the full marriage context.",
    features: ["Mars from Lagna, Moon and Venus", "Houses 1, 2, 4, 7, 8 and 12", "Cancellation and mitigation audit", "Mars D1/D9 strength and aspects", "Seventh house, Venus and Jupiter context"],
    steps: ["Enter exact birth details.", "The calculator checks all three Manglik reference points.", "Review raw placements, cancellations and broader marriage indicators."],
    faq: [
      { q: "Are Kuja Dosha and Mangal Dosha the same?", a: "Yes. Kuja and Mangal are names for Mars; both terms refer to the traditional Manglik placement check." },
      { q: "Which houses create Mangal Dosha?", a: "This calculator uses houses 1, 2, 4, 7, 8 and 12 from the Lagna, Moon and Venus. Some traditions omit the second house." },
      { q: "Does Mangal Dosha end after age 28?", a: "That popular rule is not universally accepted. Zodiac Veda does not automatically erase the placement at age 28 and shows classical cancellations separately." },
    ],
  },
  "nakshatra-rashi": {
    name: "Nakshatra, Pada & Moon Sign Calculator",
    shortName: "Nakshatra & Rashi",
    path: "/calculators/nakshatra-rashi",
    title: "Nakshatra Calculator – Find Birth Star, Pada & Moon Sign",
    description: "Calculate your exact Janma Nakshatra, Pada, Moon sign (Rashi), birth syllable, Avakhada Chakra, Panchang, Tara Chakra and interpretation.",
    keywords: ["Nakshatra calculator", "birth star calculator", "Rashi calculator", "Moon sign calculator Vedic", "Nakshatra Pada calculator", "Janma Nakshatra", "birth syllable", "Avakhada Chakra"],
    intro: "Find the Moon's exact sidereal sign, 13°20′ birth star and 3°20′ Pada at your recorded birth time. The report explains all four Padas and traditional Avakhada classifications.",
    features: ["Exact Moon degree and progress through the star", "Janma Nakshatra, Pada and Navamsa", "Birth syllable, Gana, Yoni and Nadi", "Moon sign traits and Moon condition", "Panchang, Tara Chakra and lucky factors"],
    steps: ["Enter exact date, time and birth city.", "The engine calculates the sidereal Moon longitude.", "Open the saved Nakshatra, Rashi and Avakhada report."],
    faq: [
      { q: "Can I find Nakshatra from date of birth only?", a: "An accurate result needs the time and place too because the Moon moves about 13 degrees per day and can cross a Pada or Nakshatra boundary." },
      { q: "How long is one Nakshatra and Pada?", a: "Each Nakshatra spans 13°20′ of the zodiac and contains four Padas of 3°20′ each." },
      { q: "What is the difference between Rashi and Nakshatra?", a: "Rashi is the Moon's 30-degree zodiac sign. Nakshatra is the smaller 13°20′ lunar mansion containing the Moon." },
    ],
  },
  "vimshottari-dasha": {
    name: "Vimshottari Dasha Calculator",
    shortName: "Vimshottari Dasha",
    path: "/calculators/vimshottari-dasha",
    title: "Vimshottari Dasha Calculator – Mahadasha, Antardasha & Pratyantar",
    description: "Calculate the complete 120-year Vimshottari timeline with Mahadasha, Antardasha, Pratyantar Dasha, current period predictions, dates and remedies.",
    keywords: ["Vimshottari Dasha calculator", "Mahadasha calculator", "Antardasha calculator", "Pratyantar Dasha", "Dasha calculator by date of birth", "current Mahadasha", "Vedic astrology Dasha", "Dasha timeline"],
    intro: "Calculate the 120-year Vimshottari sequence from the Moon's Nakshatra, including the balance at birth, current three-level period, future transitions and five-year Pratyantar forecast.",
    features: ["Dasha balance at birth", "Mahadasha, Antardasha and Pratyantar", "Interactive full life timeline", "Benefits, challenges and life areas", "Five-year period forecast and remedies"],
    steps: ["Enter exact birth details.", "The Moon's Nakshatra and traversed portion establish the starting balance.", "Explore the nested three-level timeline and period interpretations."],
    faq: [
      { q: "How is the starting Mahadasha calculated?", a: "It begins with the lord of the Moon's birth Nakshatra. The part of the Nakshatra already traversed determines how much of that Mahadasha had elapsed at birth." },
      { q: "How long is the Vimshottari cycle?", a: "The classical sequence totals 120 years across nine planetary lords." },
      { q: "Why can Dasha dates differ between software?", a: "Programs may use a 365.25-day civil year or a 360-day savana year and may use different ayanamsas, creating small date differences." },
    ],
  },
  "sade-sati": {
    name: "Sade Sati & Shani Dhaiya Calculator",
    shortName: "Sade Sati",
    path: "/calculators/sade-sati",
    title: "Sade Sati Calculator – Check Current Phase, Dates & Shani Dhaiya",
    description: "Check whether Sade Sati is running, exact rising/peak/setting phase dates, Shani Dhaiya, live Saturn position, natal Saturn and remedies.",
    keywords: ["Sade Sati calculator", "Shani Sade Sati calculator", "Sade Sati dates", "Sade Sati phases", "Shani Dhaiya calculator", "Ashtama Shani", "Kantaka Shani", "Saturn transit calculator"],
    intro: "Compare live sidereal Saturn with your natal Moon and get the exact rising, peak and setting phases, plus a separate fourth/eighth-house Shani Dhaiya check.",
    features: ["Live Saturn sign, degree and house from Moon", "Exact phase start and end dates", "Rising, peak and setting phase", "Kantaka and Ashtama Shani Dhaiya", "Natal Saturn strength, running Dasha and remedies"],
    steps: ["Enter exact birth date, time and place.", "The calculator compares natal Moon with current Saturn.", "Review phase dates, natal context and safe traditional practices."],
    faq: [
      { q: "What is Sade Sati?", a: "It is the period while Saturn transits the 12th, same and second zodiac signs from the natal Moon—roughly seven and a half years." },
      { q: "What are the three Sade Sati phases?", a: "They are the rising phase (12th from Moon), peak phase (over the Moon sign), and setting phase (second from Moon)." },
      { q: "Is Shani Dhaiya part of Sade Sati?", a: "No. Dhaiya usually refers to Saturn in the fourth or eighth sign from the Moon and is shown separately." },
    ],
  },
} as const satisfies Record<string, CalculatorSeo>;

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function calculatorMetadata(slug: SeoSlug): Metadata {
  const seo = CALCULATOR_SEO[slug];
  const url = absoluteUrl(seo.path);
  return {
    title: { absolute: seo.title },
    description: seo.description,
    keywords: [...seo.keywords, "Zodiac Veda", "free Vedic astrology calculator"],
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: seo.title,
      description: seo.description,
      images: [{ url: absoluteUrl("/opengraph-image"), width: 1200, height: 630, alt: `${seo.shortName} — ${SITE_NAME}` }],
    },
    twitter: { card: "summary_large_image", title: seo.title, description: seo.description, images: [absoluteUrl("/opengraph-image")] },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  };
}

export function calculatorJsonLd(slug: SeoSlug) {
  const seo = CALCULATOR_SEO[slug];
  const url = absoluteUrl(seo.path);
  return [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: seo.name,
      alternateName: seo.keywords.slice(0, 4),
      description: seo.description,
      url,
      applicationCategory: "LifestyleApplication",
      applicationSubCategory: "Vedic Astrology Calculator",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript in a modern web browser",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      featureList: seo.features.join("; "),
      inLanguage: "en",
      isAccessibleForFree: true,
      dateModified: SEO_UPDATED,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: seo.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Vedic Astrology Calculators", item: absoluteUrl("/#calculators") },
        { "@type": "ListItem", position: 2, name: seo.shortName, item: url },
      ],
    },
  ];
}
