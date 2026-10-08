# Marriage matching v1.0 — reproducible calculation choices

## Shared horoscope calculations
Both birth profiles are passed through `computeChart()` in `src/lib/astro/calc.ts`.
The existing main-horoscope settings remain unchanged: Astronomy Engine,
Lahiri sidereal ayanamsa, whole-sign houses, mean lunar nodes, D1 and D9.
No extra astrology API or API key is required.

## Score convention
North Indian Ashtakoota; maximum 36. Person 1 is the traditional groom
column and Person 2 the traditional bride column. The form and report disclose
this orientation because Varna, Vashya and Gana can be directional.
The individual chart's sex field does not silently swap the scoring columns.

- Varna: 1 point for the traditional groom-column ordering, otherwise 0.
  Historical labels are not an assessment of caste, worth or character.
- Vashya: the published five-category matrix from Anytime Astro. Sagittarius
  and Capricorn are classified using the exact Moon degree at 15 degrees.
- Tara: inclusive nakshatra counting in BOTH directions. Modulo-nine residues
  3, 5 and 7 are unfavourable (0 points); other residues give 1.5 per direction.
- Yoni: the 14-animal matrix published by AAPS; same animal 4. The source's
  Horse–Deer entry is 3; some other conventions use 1. Table shown in report.
- Graha Maitri: natural friendship (not temporary/compound friendship): same
  or mutual friends 5, friend-neutral 4, neutral-neutral 3, friend-enemy 1,
  neutral-enemy 0.5, mutual enemies 0.
- Gana: AAPS directional rules. Same 6; groom Deva/bride Manushya 6;
  reversed 5; groom Rakshasa/bride Deva 1; remaining mixed combinations 0.
- Bhakoot: same and 1/7, 3/11, 4/10 pairs 7; 2/12, 5/9, 6/8 pairs 0.
- Nadi: different groups 8; identical group 0.

Raw points are never silently restored by cancellation/mitigation notes.
Exceptions are displayed separately and identified as tradition-dependent.
The result is not South Indian ten-Porutham matching and does not claim that
all external astrology sites will give the same score.

## Additional report checks
- Main-horoscope Mangal/Kuja detection is reused unchanged for both partners,
  including the existing second-house convention and cancellation notes.
- Moon-sign and Navamsa-sign lord context for Nadi/Bhakoot/Gana review.
- The original individual marriage interpretation, seventh lord and D9.
- Dasha snapshot at the saved calculation date.
- Next-five-year overlaps where both Antardasha lords are Venus, Jupiter or
  their own seventh lord. This is a broad theme filter, not wedding muhurta or
  a guarantee of marriage.
- Boundary warnings when a ten-minute birth-time error could move the Moon
  across a sign, nakshatra or pada boundary.

## Persistence and privacy
`POST /api/matches` validates both inputs, calculates both charts and saves
both charts plus a matching report in ONE Drizzle transaction. Report and
chart links use random 32-character UUID-derived slugs. Saved reports are
not publicly listed. Anyone possessing a report link can view both birth
profiles; the form and report disclose this. Drafts are stored on the user's
own device, with a clear-details control.

## Sources for numerical rules
- https://aaps.space/kundli-matching/
- https://aaps.space/blog/yoni-matching-chart/
- https://www.anytimeastro.com/blog/astrology/vasya-koota/

## Limitations
A Guna score is a traditional symbolic assessment, not a scientific chance
of a successful marriage and not a genetic, fertility or medical test.
Remedies are optional devotional practices, not guaranteed corrections.
Gemstones are not prescribed from a pair score alone.

## Tests
- `npx --yes tsx tests/marriage-matching.test.ts`
- `PLAYWRIGHT_CORE_PATH=/path/to/playwright-core node tests/marriage-matching.e2e.cjs`
- Final required build checks are recorded in `docs/CALCULATOR_PROGRESS.md`.
