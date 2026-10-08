export type WesternBody =
  | "Sun"
  | "Moon"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn"
  | "Uranus"
  | "Neptune"
  | "Pluto"
  | "North Node"
  | "South Node";

export const WESTERN_BODIES: WesternBody[] = [
  "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "North Node", "South Node",
];

export const PERSONAL: WesternBody[] = ["Sun", "Moon", "Mercury", "Venus", "Mars"];
export const SOCIAL: WesternBody[] = ["Jupiter", "Saturn"];
export const OUTER: WesternBody[] = ["Uranus", "Neptune", "Pluto"];

export const SIGN_NAMES = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"] as const;
export const SIGN_GLYPH = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
export const ELEMENTS = ["Fire", "Earth", "Air", "Water"] as const;
export const MODES = ["Cardinal", "Fixed", "Mutable"] as const;
export const SIGN_ELEMENT: Array<(typeof ELEMENTS)[number]> = ["Fire", "Earth", "Air", "Water", "Fire", "Earth", "Air", "Water", "Fire", "Earth", "Air", "Water"];
export const SIGN_MODE: Array<(typeof MODES)[number]> = ["Cardinal", "Fixed", "Mutable", "Cardinal", "Fixed", "Mutable", "Cardinal", "Fixed", "Mutable", "Cardinal", "Fixed", "Mutable"];
export const SIGN_RULER: WesternBody[] = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Pluto", "Jupiter", "Saturn", "Uranus", "Neptune"];
export const TRADITIONAL_RULER: WesternBody[] = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];

export const BODY_META: Record<WesternBody, {
  glyph: string;
  color: string;
  keywords: string;
  domicile: number[];
  exalt: number;
  meaning: string;
}> = {
  Sun: { glyph: "☉", color: "#f59e0b", keywords: "identity, vitality, purpose, creative will", domicile: [4], exalt: 0, meaning: "The core self, life-force and conscious purpose." },
  Moon: { glyph: "☽", color: "#e2e8f0", keywords: "emotions, needs, body memory, belonging", domicile: [3], exalt: 1, meaning: "The feeling nature, habits and inner security." },
  Mercury: { glyph: "☿", color: "#86efac", keywords: "mind, speech, learning, trade", domicile: [2, 5], exalt: 5, meaning: "Perception, language and how you make sense of things." },
  Venus: { glyph: "♀", color: "#f9a8d4", keywords: "love, taste, value, harmony", domicile: [1, 6], exalt: 11, meaning: "Attraction, pleasure, money-sense and relating." },
  Mars: { glyph: "♂", color: "#f87171", keywords: "drive, anger, desire, courage", domicile: [0, 7], exalt: 9, meaning: "Will-to-act, conflict style and physical heat." },
  Jupiter: { glyph: "♃", color: "#c4b5fd", keywords: "growth, faith, meaning, luck", domicile: [8, 11], exalt: 3, meaning: "Expansion, belief, teachers and the bigger picture." },
  Saturn: { glyph: "♄", color: "#94a3b8", keywords: "structure, duty, time, mastery", domicile: [9, 10], exalt: 6, meaning: "Limits, craft, responsibility and earned authority." },
  Uranus: { glyph: "♅", color: "#67e8f9", keywords: "awakening, freedom, invention, rupture", domicile: [10], exalt: 7, meaning: "The shock of the new, independence and future-mind." },
  Neptune: { glyph: "♆", color: "#818cf8", keywords: "dream, fusion, compassion, fog", domicile: [11], exalt: 3, meaning: "Imagination, spirituality, idealisation and dissolution." },
  Pluto: { glyph: "♇", color: "#e879f9", keywords: "power, death-rebirth, the underworld", domicile: [7], exalt: 4, meaning: "Compulsion, depth-psychology and irreversible change." },
  "North Node": { glyph: "☊", color: "#fde68a", keywords: "growth edge, future path", domicile: [], exalt: -1, meaning: "The evolutionary direction this life is pulling toward." },
  "South Node": { glyph: "☋", color: "#fdba74", keywords: "familiar past, release", domicile: [], exalt: -1, meaning: "Innate skills and the pattern that is ready to be outgrown." },
};

export const HOUSE_TITLES = [
  "1st — Self, body, rising manner",
  "2nd — Money, values, possessions",
  "3rd — Mind, siblings, local world",
  "4th — Home, roots, private life",
  "5th — Creativity, romance, children",
  "6th — Work, health, service",
  "7th — Partnership, open enemies, the other",
  "8th — Shared resources, sex, transformation",
  "9th — Belief, travel, higher learning",
  "10th — Career, public image, authority",
  "11th — Friends, networks, hopes",
  "12th — Solitude, the unconscious, retreat",
];

export const HOUSE_ESSAY = [
  "The 1st house is the mask the world meets first: body, temperament, and the way you enter a room. Planets here colour the whole chart because they sit on the eastern horizon.",
  "The 2nd house shows how you earn, spend, and decide what is worth keeping — money, talent, and self-worth. It is the warehouse of the life.",
  "The 3rd house is the nervous system of daily life: talking, writing, short trips, neighbours and brothers or sisters. It is curiosity in motion.",
  "The 4th house is the keel of the ship: family of origin, the inner child, land, and the private room you return to. The IC here is the midnight of the chart.",
  "The 5th house is play with stakes: love affairs, art, children, speculation and the joy of being seen. It is the heart performing.",
  "The 6th house is craft and maintenance: job skills, habits, animals, and the body’s repair schedule. Competence lives here.",
  "The 7th house is the open ‘you’: marriage, contracts, clients and the people who complete or oppose you. The Descendant is the western gate.",
  "The 8th house is what is not solely yours: debt, inheritance, intimacy, grief and psychological depth. It is the alchemy of sharing power.",
  "The 9th house looks over the horizon: philosophy, faith, publishing, foreign places and the teacher. Meaning is the cargo.",
  "The 10th house is the noon of the chart: vocation, reputation, bosses and the mark you leave on the city. The Midheaven is your public roof.",
  "The 11th house is the chosen tribe: friends, allies, audiences and the future you are helping to invent. Hopes become politics here.",
  "The 12th house is the backstage: rest, dreams, hidden service, exile and the places you dissolve. It is both sanctuary and fog.",
];

export const ASPECT_ORBS: Record<string, number> = {
  Conjunction: 8,
  Opposition: 8,
  Trine: 7,
  Square: 7,
  Sextile: 5,
  Quincunx: 3,
  "Semi-sextile": 2,
};

export const ASPECT_ANGLE: Record<string, number> = {
  Conjunction: 0,
  "Semi-sextile": 30,
  Sextile: 60,
  Square: 90,
  Trine: 120,
  Quincunx: 150,
  Opposition: 180,
};

export const ASPECT_NATURE: Record<string, "harmonious" | "dynamic" | "neutral"> = {
  Conjunction: "neutral",
  Opposition: "dynamic",
  Trine: "harmonious",
  Square: "dynamic",
  Sextile: "harmonious",
  Quincunx: "dynamic",
  "Semi-sextile": "neutral",
};

export const ASPECT_MEANING: Record<string, string> = {
  Conjunction: "Two principles fuse and act as one. The blend can be brilliant or blind, depending on the planets.",
  Opposition: "A polarity that seeks balance through relationship, projection and conscious compromise.",
  Trine: "Easy flow and talent. The gift is real; the risk is taking it for granted.",
  Square: "Friction that forces growth. The tension is productive if you work it rather than dump it.",
  Sextile: "Opportunity that opens when you make a small, intelligent effort.",
  Quincunx: "An awkward adjustment — two needs that do not share a language and must be translated.",
  "Semi-sextile": "A subtle adjacent link; growth through small sequential steps.",
};
