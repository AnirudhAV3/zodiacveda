import { NAKSHATRAS, SIGNS, type PlanetId } from "@/lib/astro/data";
import { naturalRel } from "@/lib/astro/shadbala";

/** North Indian eight-factor scoring. First = traditional groom role; second = bride role. */
export const MATCHING_METHOD = "North Indian Ashtakoota · raw score · v1.0";
export const MATCHING_SOURCES = [
  { title: "Eight-factor rules, Tara, Graha Maitri, Gana, Bhakoot and Nadi", url: "https://aaps.space/kundli-matching/" },
  { title: "14-animal Yoni score matrix", url: "https://aaps.space/blog/yoni-matching-chart/" },
  { title: "Five-group Vashya matrix (Bride × Groom)", url: "https://www.anytimeastro.com/blog/astrology/vasya-koota/" },
];

export interface MoonSignature {
  sign: number;
  degree: number;
  nak: number;
  pada: number;
}

export interface Koota {
  key: string;
  name: string;
  topic: string;
  score: number;
  max: number;
  firstValue: string;
  secondValue: string;
  rule: string;
  evidence: string[];
  interpretation: string;
  advice: string;
}

export const VASHYA_NAMES = ["Chatushpada (Quadruped)", "Nara (Human)", "Jalachara (Aquatic)", "Vanachara (Wild)", "Keeta (Insect)"];
/** Exact 15° split; using pada alone would misclassify half-sign boundaries. */
export function vashyaIndex(sign: number, degree: number): number {
  if (sign === 8) return degree < 15 ? 1 : 0;
  if (sign === 9) return degree < 15 ? 0 : 2;
  if ([0, 1].includes(sign)) return 0;
  if ([2, 5, 6, 10].includes(sign)) return 1;
  if ([3, 11].includes(sign)) return 2;
  if (sign === 4) return 3;
  return 4;
}

/** Rows: second/bride. Columns: first/groom. The convention is named in the report. */
export const VASHYA_MATRIX = [
  [2, 1, 1, 1.5, 1],
  [1, 2, 1.5, 0, 1],
  [1, 1.5, 2, 1, 1],
  [0, 0, 0, 2, 0],
  [1, 1, 1, 0, 2],
];

export const YONI_NAMES = ["Horse", "Elephant", "Sheep", "Serpent", "Dog", "Cat", "Rat", "Cow", "Buffalo", "Tiger", "Deer", "Monkey", "Mongoose", "Lion"];
/** Symmetric North Indian matrix, as published by AAPS (including Horse–Deer = 3). */
export const YONI_MATRIX = [
  [4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 3, 3, 2, 1],
  [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0],
  [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1],
  [3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 2],
  [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1],
  [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1],
  [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2],
  [1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1],
  [0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1],
  [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1],
  [3, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1],
  [3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2],
  [2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2],
  [1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 4],
];

const TARA_NAMES = ["Janma", "Sampat", "Vipat", "Kshema", "Pratyari", "Sadhaka", "Vadha", "Mitra", "Atimitra"];
export function taraDirection(from: number, to: number) {
  const count = ((to - from + 27) % 27) + 1;
  const remainder = count % 9;
  const index = remainder === 0 ? 8 : remainder - 1;
  const favourable = ![3, 5, 7].includes(remainder);
  return { count, remainder, name: TARA_NAMES[index], favourable, score: favourable ? 1.5 : 0 };
}

export function maitriPoints(first: PlanetId, second: PlanetId) {
  if (first === second) return 5;
  const a = naturalRel(first, second);
  const b = naturalRel(second, first);
  if (a === 1 && b === 1) return 5;
  if ((a === 1 && b === 0) || (a === 0 && b === 1)) return 4;
  if (a === 0 && b === 0) return 3;
  if ((a === 1 && b === -1) || (a === -1 && b === 1)) return 1;
  if ((a === 0 && b === -1) || (a === -1 && b === 0)) return 0.5;
  return 0;
}

const GANA_NAMES = ["Deva", "Manushya", "Rakshasa"];
/** AAPS rules: groom Deva + bride Manushya = 6, reversed = 5. */
export const GANA_MATRIX = [[6, 5, 1], [6, 6, 0], [0, 0, 6]];
const VARNA_ORDER: Record<string, number> = { Shudra: 0, Vaishya: 1, Kshatriya: 2, Brahmin: 3 };
const relationWord = (r: number) => r === 1 ? "friend" : r === 0 ? "neutral" : "enemy";

export function scoreKootas(first: MoonSignature, second: MoonSignature): Koota[] {
  for (const p of [first, second]) {
    if (!Number.isInteger(p.sign) || p.sign < 0 || p.sign > 11 || !Number.isInteger(p.nak) || p.nak < 0 || p.nak > 26 || p.degree < 0 || p.degree >= 30) throw new Error("Invalid Moon position for matching.");
  }
  const a = SIGNS[first.sign];
  const b = SIGNS[second.sign];
  const na = NAKSHATRAS[first.nak];
  const nb = NAKSHATRAS[second.nak];
  const va = vashyaIndex(first.sign, first.degree);
  const vb = vashyaIndex(second.sign, second.degree);
  const t1 = taraDirection(first.nak, second.nak);
  const t2 = taraDirection(second.nak, first.nak);
  const yoniScore = YONI_MATRIX[YONI_NAMES.indexOf(na.yoni)][YONI_NAMES.indexOf(nb.yoni)];
  const ma = maitriPoints(a.lord, b.lord);
  const ganaScore = GANA_MATRIX[GANA_NAMES.indexOf(nb.gana)][GANA_NAMES.indexOf(na.gana)];
  const h1 = ((second.sign - first.sign + 12) % 12) + 1;
  const h2 = ((first.sign - second.sign + 12) % 12) + 1;
  const bhakootScore = [2, 12, 5, 9, 6, 8].includes(h1) ? 0 : 7;
  const nadiScore = na.nadi === nb.nadi ? 0 : 8;
  const varnaScore = VARNA_ORDER[a.varna] >= VARNA_ORDER[b.varna] ? 1 : 0;
  const vashyaScore = VASHYA_MATRIX[vb][va];
  return [
    {
      key: "varna", name: "Varna", topic: "Traditional temperament classification", max: 1, score: varnaScore,
      firstValue: a.varna, secondValue: b.varna,
      rule: "One point when the first person's traditional Varna rank is equal to or above the second person's, following groom–bride orientation.",
      evidence: [`${a.en}: ${a.varna}. ${b.en}: ${b.varna}.`],
      interpretation: varnaScore ? "The traditional ordering is satisfied." : "The traditional directional ordering is not satisfied; this is only one of 36 points.",
      advice: "These are historical astrological labels, not a person's caste, ability, character or worth. Both partners deserve equal respect.",
    },
    {
      key: "vashya", name: "Vashya", topic: "Mutual influence and partnership style", max: 2, score: vashyaScore,
      firstValue: VASHYA_NAMES[va], secondValue: VASHYA_NAMES[vb],
      rule: "Published five-group Bride × Groom score matrix. Sagittarius and Capricorn use the exact 15-degree Moon split.",
      evidence: [`First Moon ${first.degree.toFixed(4)}° ${a.en}: ${VASHYA_NAMES[va]}.`, `Second Moon ${second.degree.toFixed(4)}° ${b.en}: ${VASHYA_NAMES[vb]}.`, `Matrix cell [${vb + 1}, ${va + 1}] = ${vashyaScore}.`],
      interpretation: vashyaScore >= 1.5 ? "The selected matrix gives a supportive influence pairing." : "The selected matrix suggests different influence styles; negotiate decisions rather than assuming one partner should dominate.",
      advice: "Agree on shared decisions, personal boundaries and equal participation. Other regional Vashya tables can score this factor differently.",
    },
    {
      key: "tara", name: "Tara", topic: "Birth-star compatibility", max: 3, score: t1.score + t2.score,
      firstValue: na.name, secondValue: nb.name,
      rule: "Count inclusively in both directions through 27 nakshatras. Remainders 3, 5 and 7 score 0; other remainders score 1.5 per direction.",
      evidence: [`First → second: count ${t1.count}, remainder ${t1.remainder}, ${t1.name}: ${t1.score}/1.5.`, `Second → first: count ${t2.count}, remainder ${t2.remainder}, ${t2.name}: ${t2.score}/1.5.`],
      interpretation: t1.score + t2.score === 3 ? "Both birth-star directions are traditionally supportive." : "One or both birth-star directions need attention in this tradition.",
      advice: "Use regular check-ins and support each other's routines. If desired, choose ceremonial dates with a qualified astrologer; this score does not predict illness.",
    },
    {
      key: "yoni", name: "Yoni", topic: "Symbolic instinct and intimacy styles", max: 4, score: yoniScore,
      firstValue: na.yoni, secondValue: nb.yoni,
      rule: "14-animal North Indian score matrix: same 4, friendly 3, neutral 2, difficult 1, traditional enemy 0.",
      evidence: [`${na.name} = ${na.yoni}; ${nb.name} = ${nb.yoni}.`, `The published animal-pair matrix gives ${yoniScore}/4.`],
      interpretation: yoniScore >= 3 ? "The animal symbols form a supportive instinct pairing." : yoniScore === 2 ? "The animal symbols form a neutral pairing." : "The tradition flags differences in instinct and intimacy styles.",
      advice: "Open communication, consent and emotional safety matter more than animal symbolism. Discuss comfort, affection and boundaries without labels or pressure.",
    },
    {
      key: "maitri", name: "Graha Maitri", topic: "Moon-sign lord friendship", max: 5, score: ma,
      firstValue: a.lord, secondValue: b.lord,
      rule: "Natural planetary friendship only: same/mutual friends 5, friend–neutral 4, neutral–neutral 3, friend–enemy 1, neutral–enemy 0.5, mutual enemies 0.",
      evidence: a.lord === b.lord ? [`Both Moon signs are ruled by ${a.lord}.`] : [`${a.lord} regards ${b.lord} as ${relationWord(naturalRel(a.lord, b.lord))}.`, `${b.lord} regards ${a.lord} as ${relationWord(naturalRel(b.lord, a.lord))}.`],
      interpretation: ma >= 4 ? "The Moon-sign lords offer supportive mental affinity in this system." : "Different planetary dispositions suggest consciously learning each other's emotional language.",
      advice: "Listen without interruption, compare expectations and make space for different communication styles.",
    },
    {
      key: "gana", name: "Gana", topic: "Traditional temperament pairing", max: 6, score: ganaScore,
      firstValue: na.gana, secondValue: nb.gana,
      rule: "Same Gana 6; groom Deva/bride Manushya 6; groom Manushya/bride Deva 5; groom Rakshasa/bride Deva 1; remaining mixed pairs 0.",
      evidence: [`${na.name}: ${na.gana}. ${nb.name}: ${nb.gana}.`, `The directional Gana table gives ${ganaScore}/6.`],
      interpretation: ganaScore >= 5 ? "The selected tradition regards these temperament groups as supportive." : "Different traditional temperament groups are flagged for deeper chart review.",
      advice: "Deva, Manushya and Rakshasa are symbolic classifications, not moral judgments. Discuss how each person responds to conflict, independence and change.",
    },
    {
      key: "bhakoot", name: "Bhakoot", topic: "Relative Moon-sign positions", max: 7, score: bhakootScore,
      firstValue: a.en, secondValue: b.en,
      rule: "Same sign and 1/7, 3/11, 4/10 pairs score 7; 2/12, 5/9 and 6/8 pairs score 0 in the unadjusted score.",
      evidence: [`Second Moon is house ${h1} from first Moon. First Moon is house ${h2} from second Moon.`, `Relative pattern: ${[h1, h2].sort((x, y) => x - y).join("/")}.`],
      interpretation: bhakootScore ? "No raw Bhakoot mismatch is present." : "A raw Bhakoot mismatch is present. Possible mitigation is reported separately, not automatically added to the score.",
      advice: "Agree on finances, family expectations and shared responsibilities. A qualified astrologer can review the whole chart and regional exceptions.",
    },
    {
      key: "nadi", name: "Nadi", topic: "Traditional nakshatra grouping", max: 8, score: nadiScore,
      firstValue: na.nadi, secondValue: nb.nadi,
      rule: "Different Nadi groups score 8; the same Nadi group scores 0. Exceptions are disclosed separately without changing this raw score.",
      evidence: [`${na.name}: ${na.nadi}. ${nb.name}: ${nb.nadi}.`],
      interpretation: nadiScore ? "The Nadi groups differ; no raw Nadi mismatch is present." : "The Nadi groups are the same; traditional Nadi review is recommended.",
      advice: "Nadi is not a genetic, fertility or medical test and cannot determine health outcomes. Discuss medical questions with a licensed clinician, not an astrology score.",
    },
  ];
}
