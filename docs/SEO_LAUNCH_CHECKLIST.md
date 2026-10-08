# SEO launch checklist — Zodiac Veda

## Important limitation
No code change can guarantee first position in Google. Ranking depends on relevance,
content quality, site/domain history, Core Web Vitals, links and mentions, competition,
location/language and user satisfaction. This repository provides the technical and
on-page foundation; it must be paired with a stable public domain and ongoing work.

## Before launch (required)
1. Connect a stable custom HTTPS domain. Do not try to rank an E2B or temporary Arena preview URL.
2. Set both `NEXT_PUBLIC_SITE_URL` and `SITE_URL` to that exact origin, without a trailing slash.
3. Redeploy and verify:
   - `/robots.txt`
   - `/sitemap.xml`
   - `/manifest.webmanifest`
   - `/opengraph-image`
   - the canonical tag on every calculator page.
4. Add the production domain to Google Search Console and Bing Webmaster Tools.
5. Put verification tokens in `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION`.
6. Submit `/sitemap.xml` in both webmaster tools and request indexing for the homepage and 11 calculator URLs.
7. Check a calculator with Google Rich Results Test and Schema.org validator.

## Public pages that should be indexed
- `/`
- `/build`
- `/calculators/marriage-matching`
- `/calculators/all-yogas`
- `/calculators/all-doshas`
- `/calculators/gemstones`
- `/calculators/divisional-charts`
- `/calculators/kaal-sarp`
- `/calculators/mangal-dosha`
- `/calculators/nakshatra-rashi`
- `/calculators/vimshottari-dasha`
- `/calculators/sade-sati`

The detailed multi-page Kundli PDF is currently free to download. Keep pricing,
offer wording and structured data aligned with the actual user flow if this changes.

Saved personal reports (`/chart/:slug`, `/calculators/:tool/:slug`) and APIs are noindex.
Do not add saved-report URLs to the sitemap. Chart links are bearer secrets: they use
unguessable random tokens, must not be shared publicly, and are excluded from referrers.
The `/api/charts` endpoint accepts chart creation only; it does not list saved records.

## Search aliases (301 permanent redirects)
Keyword-friendly aliases redirect to canonical calculator pages, including:
`/kuja-dosha-calculator`, `/mangal-dosha-calculator`, `/kaal-sarp-dosha-calculator`,
`/sade-sati-calculator`, `/nakshatra-calculator`, `/vimshottari-dasha-calculator`,
`/kundli-matching`, `/guna-milan-calculator`, `/gemstone-calculator` and others.
Never include redirect aliases in the sitemap.

## On-page implementation
Each public calculator page has:
- a unique search-focused title and meta description;
- self-referencing canonical URL;
- calculator-specific keywords and aliases;
- Open Graph and Twitter metadata;
- crawlable introductory copy, feature list, steps and FAQs;
- SoftwareApplication, FAQPage and BreadcrumbList JSON-LD;
- internal links to related calculators;
- a single descriptive H1 and logical H2/H3 structure.

## Ongoing work needed to compete for top positions
- Publish original expert articles supporting high-intent tools (e.g. Kuja Dosha rules,
  cancellation examples, mean vs true node settings, Navamsa interpretation).
- Add editorial review and author credentials; astrology is trust-sensitive content.
- Earn genuine links/mentions from relevant astrology, culture and education websites.
- Monitor Search Console queries, impressions, CTR, indexing and Core Web Vitals monthly.
- Improve titles/content based on real query data without keyword stuffing.
- Keep calculation methodology pages current and disclose conventions that differ by school.
- Build a stable brand presence and citations. Do not buy spam backlinks or publish fake reviews.

## Acceptance checks
Run `tests/seo.test.cjs` against production. It checks indexability, metadata, canonicals,
structured data, visible SEO content, sitemap contents, robots and redirects.
