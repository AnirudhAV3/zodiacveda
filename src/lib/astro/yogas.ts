import { PLANET_INFO, SIGNS, type PlanetId } from "./data";
import type { ChartData } from "./calc";
import { activationPeriods, dedupe, planetRemedies, WORSHIP, yogaRemedies, type Remedy } from "./remedies";
import { aspectedHouses, dignity, houseFrom, houseLord, naturalNature, planet } from "./analysis";

export interface YogaResult {
  name: string;
  category: string;
  formation: string;
  effect: string;
  present: boolean;
  nature: "good" | "bad" | "mixed";
  planets: PlanetId[];
  remedies: Remedy[];
  activation: string[];
}

const SEVEN: PlanetId[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
const KEN = [1, 4, 7, 10];
const TRI = [1, 5, 9];
const DUS = [6, 8, 12];

function ctx(c: ChartData) {
  const P = (id: PlanetId) => planet(c, id);
  const H = (id: PlanetId) => P(id).house;
  const S = (id: PlanetId) => P(id).sign;
  const L = (h: number) => houseLord(c, h);
  const LH = (h: number) => H(L(h));
  const dig = (id: PlanetId) => dignity(id, S(id), P(id).deg);
  const strong = (id: PlanetId) => ["Exalted", "Own Sign", "Moolatrikona"].includes(dig(id));
  const weak = (id: PlanetId) => dig(id) === "Debilitated";
  const conj = (a: PlanetId, b: PlanetId) => a !== b && S(a) === S(b);
  const aspects = (a: PlanetId, b: PlanetId) => aspectedHouses(P(a)).includes(H(b));
  const exchange = (a: PlanetId, b: PlanetId) => a !== b && SIGNS[S(a)].lord === b && SIGNS[S(b)].lord === a;
  const related = (a: PlanetId, b: PlanetId) => a === b || conj(a, b) || (aspects(a, b) && aspects(b, a)) || exchange(a, b);
  const fromMoon = (id: PlanetId) => houseFrom(S("Moon"), S(id));
  const fromSun = (id: PlanetId) => houseFrom(S("Sun"), S(id));
  const from = (base: PlanetId, id: PlanetId) => houseFrom(S(base), S(id));
  const isBen = (id: PlanetId) => ["Jupiter", "Venus"].includes(id) || ((id === "Mercury" || id === "Moon") && naturalNature(c, id) === "Benefic");
  const isMal = (id: PlanetId) => !isBen(id);
  const inH = (h: number) => c.planets.filter((p) => p.house === h).map((p) => p.id);
  const inH7 = (h: number) => SEVEN.filter((id) => H(id) === h);
  const occ = new Set(SEVEN.map((id) => H(id)));
  const signsOcc = new Set(SEVEN.map((id) => S(id)));
  const bensIn = (hs: number[]) => SEVEN.filter((id) => isBen(id) && hs.includes(H(id)));
  const malsIn = (hs: number[]) => SEVEN.filter((id) => isMal(id) && hs.includes(H(id)));
  const allIn = (hs: number[]) => SEVEN.every((id) => hs.includes(H(id)));
  const consec = (start: number) => Array.from({ length: 7 }, (_, i) => ((start - 1 + i) % 12) + 1);
  return { P, H, S, L, LH, dig, strong, weak, conj, aspects, exchange, related, fromMoon, fromSun, from, isBen, isMal, inH, inH7, occ, signsOcc, bensIn, malsIn, allIn, consec };
}

type Def = [string, string, string, string, (x: ReturnType<typeof ctx>) => boolean, ("good" | "bad" | "mixed")?];

const mahapurusha = (id: PlanetId) => (x: ReturnType<typeof ctx>) => x.strong(id) && KEN.includes(x.H(id));

const DEFS: Def[] = [
  // Pancha Mahapurusha
  ["Ruchaka Yoga", "Pancha Mahapurusha", "Mars in own or exaltation sign in a Kendra", "Brave commander, strong body, victory over enemies, leadership in army/police/sports, wealth via land.", mahapurusha("Mars")],
  ["Bhadra Yoga", "Pancha Mahapurusha", "Mercury in own or exaltation sign in a Kendra", "Brilliant intellect, eloquence, long life, success in business, writing and scholarship.", mahapurusha("Mercury")],
  ["Hamsa Yoga", "Pancha Mahapurusha", "Jupiter in own or exaltation sign in a Kendra", "Righteous, learned, respected by rulers, spiritual wisdom, happiness and fortune.", mahapurusha("Jupiter")],
  ["Malavya Yoga", "Pancha Mahapurusha", "Venus in own or exaltation sign in a Kendra", "Beauty, luxury, vehicles, artistic talent, happy marriage and refined tastes.", mahapurusha("Venus")],
  ["Sasa Yoga", "Pancha Mahapurusha", "Saturn in own or exaltation sign in a Kendra", "Authority over masses, leadership of organisations, discipline, political power, longevity.", mahapurusha("Saturn")],
  // Lunar
  ["Sunapha Yoga", "Chandra Yogas", "A planet (other than Sun/nodes) in the 2nd from Moon", "Self-earned wealth, intelligence, good reputation, king-like status.", (x) => SEVEN.some((id) => id !== "Sun" && id !== "Moon" && x.fromMoon(id) === 2)],
  ["Anapha Yoga", "Chandra Yogas", "A planet (other than Sun/nodes) in the 12th from Moon", "Good health, charming personality, fame, comforts and renunciation in later life.", (x) => SEVEN.some((id) => id !== "Sun" && id !== "Moon" && x.fromMoon(id) === 12)],
  ["Durudhara Yoga", "Chandra Yogas", "Planets on both sides of the Moon (2nd and 12th)", "Wealth, vehicles, generosity, servants and enjoyment of life.", (x) => SEVEN.some((id) => id !== "Sun" && id !== "Moon" && x.fromMoon(id) === 2) && SEVEN.some((id) => id !== "Sun" && id !== "Moon" && x.fromMoon(id) === 12)],
  ["Kemadruma Yoga", "Chandra Yogas", "No planets in 2nd, 12th or with the Moon, and none in Kendra from Lagna", "Emotional loneliness, financial struggle and lack of support at times — often cancelled by other factors.", (x) => !SEVEN.some((id) => id !== "Sun" && id !== "Moon" && [1, 2, 12].includes(x.fromMoon(id))) && !SEVEN.some((id) => id !== "Moon" && KEN.includes(x.H(id))), "bad"],
  ["Gaja Kesari Yoga", "Chandra Yogas", "Jupiter in a Kendra from the Moon", "Intelligence, lasting fame, wealth, eloquence and victory over opponents — like an elephant-lion.", (x) => KEN.includes(x.fromMoon("Jupiter"))],
  ["Chandra-Mangala Yoga", "Chandra Yogas", "Moon conjunct Mars", "Earning power, business acumen, wealth through enterprise; can make one emotionally intense.", (x) => x.conj("Moon", "Mars"), "mixed"],
  ["Adhi Yoga (Chandra)", "Chandra Yogas", "Benefics in the 6th, 7th and/or 8th from Moon", "Leadership, minister-like status, polite, trustworthy, healthy and wealthy.", (x) => (["Mercury", "Jupiter", "Venus"] as PlanetId[]).filter((id) => [6, 7, 8].includes(x.fromMoon(id))).length >= 2],
  ["Shakata Yoga", "Chandra Yogas", "Jupiter in the 6th, 8th or 12th from the Moon", "Ups and downs in fortune like a cart wheel; wealth comes and goes.", (x) => [6, 8, 12].includes(x.fromMoon("Jupiter")) && !KEN.includes(x.H("Jupiter")), "bad"],
  ["Amala Yoga", "Chandra Yogas", "A natural benefic in the 10th from Lagna or Moon", "Spotless reputation, ethical conduct, lasting fame and prosperity.", (x) => (["Mercury", "Jupiter", "Venus"] as PlanetId[]).some((id) => x.H(id) === 10 || x.fromMoon(id) === 10)],
  ["Vasumati Yoga", "Chandra Yogas", "Benefics in Upachaya houses (3, 6, 10, 11) from Moon", "Great wealth and material prosperity; always comfortable.", (x) => (["Mercury", "Jupiter", "Venus"] as PlanetId[]).filter((id) => [3, 6, 10, 11].includes(x.fromMoon(id))).length >= 2],
  ["Pushkala Yoga", "Chandra Yogas", "Moon with Lagna lord, Moon's dispositor in Kendra", "Wealth, sweet speech, fame and honour from rulers.", (x) => x.conj("Moon", x.L(1)) && KEN.includes(x.H(SIGNS[x.S("Moon")].lord))],
  ["Gauri Yoga", "Chandra Yogas", "Strong Moon in Kendra aspected by Jupiter", "Respected family, praiseworthy deeds, beauty and happiness.", (x) => x.strong("Moon") && KEN.includes(x.H("Moon")) && x.aspects("Jupiter", "Moon")],
  // Solar
  ["Vesi Yoga", "Surya Yogas", "A planet (other than Moon) in the 2nd from Sun", "Balanced outlook, truthful, prosperous and industrious.", (x) => SEVEN.some((id) => id !== "Sun" && id !== "Moon" && x.fromSun(id) === 2)],
  ["Vasi Yoga", "Surya Yogas", "A planet (other than Moon) in the 12th from Sun", "Charitable, skilful, happy and liked by authorities.", (x) => SEVEN.some((id) => id !== "Sun" && id !== "Moon" && x.fromSun(id) === 12)],
  ["Ubhayachari Yoga", "Surya Yogas", "Planets on both sides of the Sun", "King-like status, eloquence, balanced strength and wealth.", (x) => SEVEN.some((id) => id !== "Sun" && id !== "Moon" && x.fromSun(id) === 2) && SEVEN.some((id) => id !== "Sun" && id !== "Moon" && x.fromSun(id) === 12)],
  ["Budha-Aditya Yoga", "Surya Yogas", "Sun conjunct Mercury", "Sharp intellect, communication skill, reputation, success in education and administration.", (x) => x.conj("Sun", "Mercury")],
  // Raja
  ["Kendra-Trikona Raja Yoga", "Raja Yogas", "Lord of a Kendra associated with lord of a Trikona", "Power, status, authority and success — one of the most important Raja Yogas.", (x) => [4, 7, 10].some((k) => [5, 9].some((t) => x.L(k) !== x.L(t) && x.related(x.L(k), x.L(t))))],
  ["Dharma-Karmadhipati Yoga", "Raja Yogas", "9th and 10th lords associated", "Righteous career, high position, fortune through work, fame.", (x) => x.L(9) === x.L(10) || x.related(x.L(9), x.L(10))],
  ["Yogakaraka Yoga", "Raja Yogas", "A single planet ruling both a Kendra and a Trikona, well placed", "The Yogakaraka's periods bring rise, power and prosperity.", (x) => SEVEN.some((id) => { const o = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter((h) => x.L(h) === id); return o.some((h) => [4, 7, 10].includes(h)) && o.some((h) => [5, 9].includes(h)) && ![6, 8, 12].includes(x.H(id)); })],
  ["Neecha Bhanga Raja Yoga", "Raja Yogas", "Debilitated planet whose debilitation is cancelled", "Rise after initial struggle; great success from humble beginnings.", (x) => SEVEN.some((id) => { if (!x.weak(id)) return false; const dl = SIGNS[x.S(id)].lord; const el = SIGNS[PLANET_INFO[id].exalt[0]].lord; return KEN.includes(x.H(dl)) || KEN.includes(x.H(el)) || KEN.includes(x.fromMoon(dl)) || x.conj(id, dl); })],
  ["Harsha Viparita Raja Yoga", "Raja Yogas", "6th lord in 6th, 8th or 12th", "Victory over enemies, good health, happiness and fame after adversity.", (x) => DUS.includes(x.LH(6))],
  ["Sarala Viparita Raja Yoga", "Raja Yogas", "8th lord in 6th, 8th or 12th", "Long life, fearlessness, learning, prosperity and conquering obstacles.", (x) => DUS.includes(x.LH(8))],
  ["Vimala Viparita Raja Yoga", "Raja Yogas", "12th lord in 6th, 8th or 12th", "Frugal, independent, noble conduct, good savings and respected.", (x) => DUS.includes(x.LH(12))],
  ["Maha Parivartana Yoga", "Raja Yogas", "Exchange of signs between lords of auspicious houses", "Powerful rise, wealth, vehicles, honour and support from authorities.", (x) => SEVEN.some((a) => SEVEN.some((b) => a < b && x.exchange(a, b) && ![3, 6, 8, 12].includes(x.H(a)) && ![3, 6, 8, 12].includes(x.H(b))))],
  ["Dainya Parivartana Yoga", "Raja Yogas", "Exchange involving lord of 6th, 8th or 12th", "Struggles, obstacles and fluctuating fortunes; later improvement.", (x) => SEVEN.some((a) => SEVEN.some((b) => a < b && x.exchange(a, b) && (DUS.includes(x.H(a)) || DUS.includes(x.H(b))))), "bad"],
  ["Khala Parivartana Yoga", "Raja Yogas", "Exchange involving lord of 3rd house", "Fluctuating temperament; success through courage and effort.", (x) => SEVEN.some((a) => SEVEN.some((b) => a < b && x.exchange(a, b) && (x.H(a) === 3 || x.H(b) === 3))), "mixed"],
  ["Lagna-Karma Raja Yoga", "Raja Yogas", "Lagna lord in 10th or 10th lord in Lagna", "Self-made success, career defines identity, recognised in profession.", (x) => x.LH(1) === 10 || x.LH(10) === 1],
  // Named
  ["Lakshmi Yoga", "Dhana & Named Yogas", "9th lord strong in Kendra/Trikona and Lagna lord strong", "Wealth, beauty, noble character, many comforts — blessings of Goddess Lakshmi.", (x) => x.strong(x.L(9)) && [...KEN, 5, 9].includes(x.LH(9)) && !x.weak(x.L(1))],
  ["Saraswati Yoga", "Dhana & Named Yogas", "Jupiter, Venus, Mercury in Kendra/Trikona/2nd, Jupiter strong", "Great learning, poetry, fame, wealth and eloquence — blessings of Saraswati.", (x) => (["Jupiter", "Venus", "Mercury"] as PlanetId[]).every((id) => [1, 2, 4, 5, 7, 9, 10].includes(x.H(id))) && !x.weak("Jupiter")],
  ["Parvata Yoga", "Dhana & Named Yogas", "Benefics in Kendras and 6th/8th free of malefics", "Prosperous, charitable, famous, head of a town or organisation.", (x) => x.bensIn(KEN).length >= 2 && x.malsIn([6, 8]).length === 0],
  ["Kahala Yoga", "Dhana & Named Yogas", "4th and 9th lords in mutual Kendras, Lagna lord strong", "Bold, commanding, head of an army or group, stubborn but successful.", (x) => KEN.includes(houseFrom(x.S(x.L(4)), x.S(x.L(9)))) && !x.weak(x.L(1)) && x.L(4) !== x.L(9)],
  ["Chamara Yoga", "Dhana & Named Yogas", "Lagna lord exalted in Kendra aspected by Jupiter", "Royal honour, eloquence, learning, long life.", (x) => x.dig(x.L(1)) === "Exalted" && KEN.includes(x.LH(1)) && (x.aspects("Jupiter", x.L(1)) || x.conj("Jupiter", x.L(1)))],
  ["Shankha Yoga", "Dhana & Named Yogas", "5th and 6th lords in mutual Kendras, Lagna lord strong", "Humane, pious, long-lived, wealthy with spouse and children.", (x) => x.L(5) !== x.L(6) && KEN.includes(houseFrom(x.S(x.L(5)), x.S(x.L(6)))) && !x.weak(x.L(1))],
  ["Bheri Yoga", "Dhana & Named Yogas", "Venus and Jupiter in Kendra with strong 9th lord", "Long life, wealth, fame, royal favour and happy family.", (x) => KEN.includes(x.H("Venus")) && KEN.includes(x.H("Jupiter")) && !x.weak(x.L(9))],
  ["Mridanga Yoga", "Dhana & Named Yogas", "Exalted or own-sign planets in Kendras/Trikonas with strong Lagna lord", "Fame, authority, happiness and respect.", (x) => SEVEN.filter((id) => x.strong(id) && [...KEN, 5, 9].includes(x.H(id))).length >= 2 && !x.weak(x.L(1))],
  ["Srinatha Yoga", "Dhana & Named Yogas", "7th lord exalted in 10th and 10th lord with 9th lord", "Wealth, pleasure, fame — like Lord Vishnu himself.", (x) => x.dig(x.L(7)) === "Exalted" && x.LH(7) === 10 && x.related(x.L(10), x.L(9))],
  ["Kusuma Yoga", "Dhana & Named Yogas", "Venus in Kendra, Moon in Trikona, Saturn in 10th", "Head of a community, generous, famous and prosperous.", (x) => KEN.includes(x.H("Venus")) && TRI.includes(x.H("Moon")) && x.H("Saturn") === 10],
  ["Matsya Yoga", "Dhana & Named Yogas", "Benefics in 1st and 9th, malefics in 4th and 8th", "Religious, compassionate, astrologer, strong and famous.", (x) => x.bensIn([1]).length > 0 && x.bensIn([9]).length > 0 && x.malsIn([4]).length > 0 && x.malsIn([8]).length > 0],
  ["Kurma Yoga", "Dhana & Named Yogas", "Benefics in 5th, 6th, 7th and malefics in 1st, 3rd, 11th", "Fame, virtue, happiness and leadership.", (x) => x.bensIn([5, 6, 7]).length >= 2 && x.malsIn([1, 3, 11]).length >= 2],
  ["Khadga Yoga", "Dhana & Named Yogas", "2nd lord in 9th and 9th lord in 2nd, Lagna lord in Kendra/Trikona", "Wealth, fortune, learning, gratitude and skill.", (x) => x.LH(2) === 9 && x.LH(9) === 2 && [...KEN, 5, 9].includes(x.LH(1))],
  ["Amsavatara Yoga", "Dhana & Named Yogas", "Venus, Jupiter and exalted Saturn in Kendras", "Famous, learned, sensual, ruler-like, controls senses.", (x) => KEN.includes(x.H("Venus")) && KEN.includes(x.H("Jupiter")) && KEN.includes(x.H("Saturn")) && x.dig("Saturn") === "Exalted"],
  ["Hari Yoga", "Dhana & Named Yogas", "Benefics in 2nd, 12th and 8th from 2nd lord", "Happiness, learning, wealth and children.", (x) => { const b = x.L(2); return SEVEN.filter((id) => x.isBen(id) && [2, 8, 12].includes(x.from(b, id))).length >= 2; }],
  ["Hara Yoga", "Dhana & Named Yogas", "Benefics in 4th, 9th and 8th from 7th lord", "Happy, learned, wealthy and virtuous.", (x) => { const b = x.L(7); return SEVEN.filter((id) => x.isBen(id) && [4, 8, 9].includes(x.from(b, id))).length >= 2; }],
  ["Brahma Yoga", "Dhana & Named Yogas", "Benefics in 4th, 10th and 11th from Lagna lord", "Learned, long-lived, wealthy, charitable.", (x) => { const b = x.L(1); return SEVEN.filter((id) => x.isBen(id) && [4, 10, 11].includes(x.from(b, id))).length >= 2; }],
  ["Mahabhagya Yoga", "Dhana & Named Yogas", "Male: day birth with Lagna, Sun, Moon in odd signs (female: night, even signs)", "Highly fortunate, generous, famous, long life.", (x) => { const day = x.H("Sun") >= 7; const odd = (s: number) => s % 2 === 0; return day ? [0, 1, 2].every((i) => odd([x.P("Sun").sign, x.P("Moon").sign, (x.S("Sun") - x.H("Sun") + 13) % 12][i])) : [x.P("Sun").sign, x.P("Moon").sign].every((s) => !odd(s)); }],
  ["Chatussagara Yoga", "Dhana & Named Yogas", "All four Kendras occupied", "Fame across the four oceans, wealth, good children, long life.", (x) => KEN.every((h) => x.inH(h).length > 0)],
  ["Rajalakshana Yoga", "Dhana & Named Yogas", "Jupiter, Venus, Mercury and Moon in Lagna or Kendras", "Royal features, attractive, virtuous and respected.", (x) => (["Jupiter", "Venus", "Mercury", "Moon"] as PlanetId[]).filter((id) => KEN.includes(x.H(id))).length >= 3],
  ["Kalanidhi Yoga", "Dhana & Named Yogas", "Jupiter in 2nd or 5th associated with Mercury and Venus", "Wealth, honour, virtue, royal patronage.", (x) => [2, 5].includes(x.H("Jupiter")) && (x.related("Jupiter", "Mercury") || x.related("Jupiter", "Venus"))],
  ["Srikantha Yoga", "Dhana & Named Yogas", "Lagna lord, Sun and Moon in Kendras/Trikonas", "Devotee of Shiva, virtuous, prosperous and respected.", (x) => [x.L(1), "Sun" as PlanetId, "Moon" as PlanetId].every((id) => [...KEN, 5, 9].includes(x.H(id)))],
  ["Bhaskara Yoga", "Dhana & Named Yogas", "Mercury 2nd from Sun, Moon 11th from Mercury, Jupiter trine Moon", "Courageous, learned in scriptures, wealthy and powerful.", (x) => x.fromSun("Mercury") === 2 && x.from("Mercury", "Moon") === 11 && [5, 9].includes(x.fromMoon("Jupiter"))],
  ["Indra Yoga", "Dhana & Named Yogas", "5th and 11th lords exchange, Moon in 5th", "Famous, brave, king-like status.", (x) => x.exchange(x.L(5), x.L(11)) && x.H("Moon") === 5],
  ["Marud Yoga", "Dhana & Named Yogas", "Jupiter 5th/9th from Venus, Moon 5th from Jupiter, Sun in Kendra from Moon", "Eloquent, broad-minded, wealthy, business leader.", (x) => [5, 9].includes(x.from("Venus", "Jupiter")) && x.from("Jupiter", "Moon") === 5 && KEN.includes(x.fromMoon("Sun"))],
  ["Budha Yoga", "Dhana & Named Yogas", "Jupiter in Lagna, Moon in Kendra, Rahu 2nd from Moon", "Learned, famous, royal qualities.", (x) => x.H("Jupiter") === 1 && KEN.includes(x.H("Moon")) && x.fromMoon("Rahu") === 2],
  ["Parijata Yoga", "Dhana & Named Yogas", "Dispositor of Lagna lord strong in Kendra/Trikona", "Happiness in middle and later life, respected, generous.", (x) => { const d = SIGNS[x.S(x.L(1))].lord; return x.strong(d) && [...KEN, 5, 9].includes(x.H(d)); }],
  ["Jaya Yoga", "Dhana & Named Yogas", "6th lord debilitated and 10th lord exalted", "Victory over opponents, success in all undertakings.", (x) => x.weak(x.L(6)) && x.dig(x.L(10)) === "Exalted"],
  ["Vidyut Yoga", "Dhana & Named Yogas", "11th lord exalted and Venus in Kendra from Lagna lord", "Charitable, pleasure-loving, lord of wealth.", (x) => x.dig(x.L(11)) === "Exalted" && KEN.includes(x.from(x.L(1), "Venus"))],
  ["Shiva Yoga", "Dhana & Named Yogas", "5th lord in 9th, 9th lord in 10th, 10th lord in 5th", "Wisdom, virtue, commanding authority, conqueror.", (x) => x.LH(5) === 9 && x.LH(9) === 10 && x.LH(10) === 5],
  ["Trilochana Yoga", "Dhana & Named Yogas", "Sun, Moon and Mars in mutual trines", "Wealth, intelligence, long life, destroys enemies.", (x) => TRI.includes(x.fromSun("Moon")) && TRI.includes(x.fromSun("Mars")) && TRI.includes(x.from("Moon", "Mars"))],
  ["Gandharva Yoga", "Dhana & Named Yogas", "10th lord in 3rd/7th/11th, Lagna lord with Jupiter", "Skilled in fine arts, music and dance; famous and long-lived.", (x) => [3, 7, 11].includes(x.LH(10)) && x.conj(x.L(1), "Jupiter")],
  ["Lagnadhi Yoga", "Dhana & Named Yogas", "Benefics in 6th, 7th and 8th from Lagna", "Great person, learned, happy and wealthy.", (x) => x.bensIn([6, 7, 8]).length >= 2 && x.malsIn([6, 7, 8]).length === 0],
  ["Shubha Kartari Yoga", "Dhana & Named Yogas", "Lagna hemmed between benefics in 2nd and 12th", "Protected life, good health, wealth and virtue.", (x) => x.bensIn([2]).length > 0 && x.bensIn([12]).length > 0],
  ["Lakshmi-Narayana Yoga", "Dhana & Named Yogas", "Venus conjunct Mercury", "Wealth, artistic intelligence, diplomacy and prosperity.", (x) => x.conj("Venus", "Mercury")],
  ["Guru-Mangala Yoga", "Dhana & Named Yogas", "Jupiter associated with Mars", "Righteous courage, success in property, law, engineering and leadership.", (x) => x.related("Jupiter", "Mars")],
  ["Akhanda Samrajya Yoga", "Dhana & Named Yogas", "Jupiter lord of 2/5/11 in Kendra from Moon", "Unbroken authority, lasting power and wealth.", (x) => [2, 5, 11].some((h) => x.L(h) === "Jupiter") && KEN.includes(x.fromMoon("Jupiter"))],
  ["Ravi Yoga", "Dhana & Named Yogas", "Sun in 10th and 10th lord in 3rd", "Scientific mind, high position, respected by government.", (x) => x.H("Sun") === 10 && x.LH(10) === 3],
  ["Dhana Yoga (2nd–11th)", "Dhana & Named Yogas", "2nd and 11th lords associated", "Steady income and accumulation of wealth.", (x) => x.L(2) === x.L(11) || x.related(x.L(2), x.L(11))],
  ["Dhana Yoga (5th–9th)", "Dhana & Named Yogas", "5th and 9th lords associated", "Fortune, wealth through intelligence and luck.", (x) => x.L(5) === x.L(9) || x.related(x.L(5), x.L(9))],
  ["Dhana Yoga (1st–2nd)", "Dhana & Named Yogas", "Lagna and 2nd lords associated", "Self-earned wealth and strong family support.", (x) => x.L(1) === x.L(2) || x.related(x.L(1), x.L(2))],
  ["Dhana Yoga (1st–11th)", "Dhana & Named Yogas", "Lagna and 11th lords associated", "Gains through own efforts and networks.", (x) => x.L(1) === x.L(11) || x.related(x.L(1), x.L(11))],
  ["Bhagya Yoga", "Life Area Yogas", "9th lord in 9th or Lagna lord in 9th", "Fortunate life, blessings of father and guru, luck in endeavours.", (x) => x.LH(9) === 9 || x.LH(1) === 9],
  ["Vidya Yoga", "Life Area Yogas", "5th lord associated with Jupiter or Mercury in Kendra/Trikona", "Excellent education and scholarly achievements.", (x) => [...KEN, 5, 9].includes(x.LH(5)) && (x.related(x.L(5), "Jupiter") || x.related(x.L(5), "Mercury"))],
  ["Putra Yoga", "Life Area Yogas", "5th lord in Kendra/Trikona and Jupiter unafflicted", "Blessed with good children who bring happiness.", (x) => [...KEN, 5, 9].includes(x.LH(5)) && !x.weak("Jupiter")],
  ["Kalatra Sukha Yoga", "Life Area Yogas", "7th lord and Venus well placed, not in dusthana", "Harmonious marriage and supportive spouse.", (x) => !DUS.includes(x.LH(7)) && !DUS.includes(x.H("Venus")) && !x.weak("Venus")],
  ["Videsh Yoga", "Life Area Yogas", "12th lord in 9th/12th or Rahu in 9th/12th/7th", "Foreign travel, residence or career abroad.", (x) => [9, 12].includes(x.LH(12)) || [7, 9, 12].includes(x.H("Rahu"))],
  ["Sukha Yoga", "Life Area Yogas", "4th lord in Kendra/Trikona in good dignity", "Domestic happiness, property and peace of mind.", (x) => [...KEN, 5, 9].includes(x.LH(4)) && !x.weak(x.L(4))],
  ["Vahana Yoga", "Life Area Yogas", "4th lord associated with Venus", "Fine vehicles and comforts of travel.", (x) => x.related(x.L(4), "Venus")],
  ["Kirti Yoga", "Life Area Yogas", "10th lord in 10th or strong Sun in 10th/11th", "Fame, recognition and professional honours.", (x) => x.LH(10) === 10 || ([10, 11].includes(x.H("Sun")) && !x.weak("Sun"))],
  ["Ayur Yoga", "Life Area Yogas", "8th lord and Saturn strong or in Kendra", "Long life and resilience.", (x) => (x.strong(x.L(8)) || KEN.includes(x.LH(8))) && !x.weak("Saturn")],
  // Nabhasa - Ashraya
  ["Rajju Yoga", "Nabhasa Yogas", "All planets in movable signs", "Fond of travel, handsome, earns in foreign lands.", (x) => SEVEN.every((id) => x.S(id) % 3 === 0)],
  ["Musala Yoga", "Nabhasa Yogas", "All planets in fixed signs", "Proud, wealthy, learned, steady mind, famous.", (x) => SEVEN.every((id) => x.S(id) % 3 === 1)],
  ["Nala Yoga", "Nabhasa Yogas", "All planets in dual signs", "Skilful, wealthy, clever, collects money.", (x) => SEVEN.every((id) => x.S(id) % 3 === 2)],
  ["Mala Yoga", "Nabhasa Yogas", "Benefics occupy three Kendras", "Happy, wealthy, vehicles, good spouse.", (x) => KEN.filter((h) => x.inH7(h).some((id) => x.isBen(id))).length >= 3],
  ["Sarpa Yoga", "Nabhasa Yogas", "Malefics occupy three Kendras", "Crooked, suffering, dependent on others.", (x) => KEN.filter((h) => x.inH7(h).some((id) => x.isMal(id))).length >= 3, "bad"],
  ["Gola Yoga", "Nabhasa Yogas", "All seven planets in one sign", "Poor, dirty, unlearned — very rare.", (x) => x.signsOcc.size === 1, "bad"],
  ["Yuga Yoga", "Nabhasa Yogas", "All planets in two signs", "Heretical, poor, rejected by society.", (x) => x.signsOcc.size === 2, "bad"],
  ["Shoola Yoga", "Nabhasa Yogas", "All planets in three signs", "Sharp, lazy, brave, fond of fights.", (x) => x.signsOcc.size === 3, "mixed"],
  ["Kedara Yoga", "Nabhasa Yogas", "All planets in four signs", "Agriculturist, truthful, helpful, wealthy.", (x) => x.signsOcc.size === 4],
  ["Pasha Yoga", "Nabhasa Yogas", "All planets in five signs", "Earns skilfully, many servants, talkative.", (x) => x.signsOcc.size === 5, "mixed"],
  ["Damini Yoga", "Nabhasa Yogas", "All planets in six signs", "Helpful, wealthy, famous, many children.", (x) => x.signsOcc.size === 6],
  ["Veena Yoga", "Nabhasa Yogas", "All planets in seven signs", "Fond of music, dance and fine arts; leader.", (x) => x.signsOcc.size === 7],
  ["Gada Yoga", "Nabhasa Yogas", "All planets in two successive Kendras", "Wealthy, performs religious rites, skilled in arts.", (x) => [[1, 4], [4, 7], [7, 10], [10, 1]].some((hs) => x.allIn(hs))],
  ["Shakata (Nabhasa) Yoga", "Nabhasa Yogas", "All planets in 1st and 7th houses", "Diseased, poor, lives by driving carts.", (x) => x.allIn([1, 7]), "bad"],
  ["Vihaga Yoga", "Nabhasa Yogas", "All planets in 4th and 10th houses", "Wanderer, messenger, quarrelsome.", (x) => x.allIn([4, 10]), "mixed"],
  ["Shringataka Yoga", "Nabhasa Yogas", "All planets in 1st, 5th and 9th houses", "Fond of quarrels, brave, fortunate, happy.", (x) => x.allIn([1, 5, 9])],
  ["Hala Yoga", "Nabhasa Yogas", "All planets in mutual trines other than Lagna", "Agriculturist, eats much, poor-to-moderate.", (x) => x.allIn([2, 6, 10]) || x.allIn([3, 7, 11]) || x.allIn([4, 8, 12]), "mixed"],
  ["Vajra Yoga", "Nabhasa Yogas", "Benefics in 1st & 7th, malefics in 4th & 10th", "Happy in early and late life, brave, attractive.", (x) => x.bensIn([1, 7]).length >= 2 && x.malsIn([4, 10]).length >= 2 && x.allIn([1, 4, 7, 10])],
  ["Yava Yoga", "Nabhasa Yogas", "Malefics in 1st & 7th, benefics in 4th & 10th", "Happy in middle life, charitable, steady.", (x) => x.malsIn([1, 7]).length >= 2 && x.bensIn([4, 10]).length >= 2 && x.allIn([1, 4, 7, 10])],
  ["Kamala Yoga", "Nabhasa Yogas", "All planets in the four Kendras", "Very famous, virtuous, long life, like a king.", (x) => x.allIn(KEN)],
  ["Vapi Yoga", "Nabhasa Yogas", "All planets in Panapharas or Apoklimas", "Accumulates wealth, happy, enjoys comforts.", (x) => x.allIn([2, 5, 8, 11]) || x.allIn([3, 6, 9, 12])],
  ["Yupa Yoga", "Nabhasa Yogas", "All planets in houses 1–4", "Spiritual, charitable, performs sacrifices.", (x) => x.allIn([1, 2, 3, 4])],
  ["Ishu Yoga", "Nabhasa Yogas", "All planets in houses 4–7", "Jailor, maker of arrows, hunter.", (x) => x.allIn([4, 5, 6, 7]), "mixed"],
  ["Shakti Yoga", "Nabhasa Yogas", "All planets in houses 7–10", "Lazy, poor, but victorious in battle.", (x) => x.allIn([7, 8, 9, 10]), "mixed"],
  ["Danda Yoga", "Nabhasa Yogas", "All planets in houses 10–1", "Loses family, serves others.", (x) => x.allIn([10, 11, 12, 1]), "bad"],
  ["Nauka Yoga", "Nabhasa Yogas", "All planets in 7 houses from Lagna", "Earns through water, famous, miserly.", (x) => x.allIn(x.consec(1)) && x.occ.size === 7],
  ["Koota Yoga", "Nabhasa Yogas", "All planets in 7 houses from 4th", "Liar, jailor, wanders in hills and forts.", (x) => x.allIn(x.consec(4)) && x.occ.size === 7, "mixed"],
  ["Chatra Yoga", "Nabhasa Yogas", "All planets in 7 houses from 7th", "Helps others, kind, happy in early and late life.", (x) => x.allIn(x.consec(7)) && x.occ.size === 7],
  ["Chapa Yoga", "Nabhasa Yogas", "All planets in 7 houses from 10th", "Brave, liar, protector of secrets.", (x) => x.allIn(x.consec(10)) && x.occ.size === 7, "mixed"],
  ["Ardha Chandra Yoga", "Nabhasa Yogas", "All planets in 7 houses from a Panaphara/Apoklima", "Handsome, commander, wealthy with ornaments.", (x) => [2, 3, 5, 6, 8, 9, 11, 12].some((s) => x.allIn(x.consec(s)) && x.occ.size === 7)],
  ["Chakra Yoga", "Nabhasa Yogas", "All planets in alternate houses from Lagna", "Emperor-like status, honoured by kings.", (x) => x.allIn([1, 3, 5, 7, 9, 11])],
  ["Samudra Yoga", "Nabhasa Yogas", "All planets in alternate houses from 2nd", "Wealthy like the ocean, enjoys comforts.", (x) => x.allIn([2, 4, 6, 8, 10, 12])],
  // Negative
  ["Daridra Yoga", "Arishta / Challenging Yogas", "11th lord in 6th, 8th or 12th", "Financial ups and downs; needs careful money management.", (x) => DUS.includes(x.LH(11)), "bad"],
  ["Grahan Yoga", "Arishta / Challenging Yogas", "Sun or Moon conjunct Rahu or Ketu", "Eclipsed confidence or mind; anxiety, obstacles related to father/mother.", (x) => x.conj("Sun", "Rahu") || x.conj("Sun", "Ketu") || x.conj("Moon", "Rahu") || x.conj("Moon", "Ketu"), "bad"],
  ["Guru Chandal Yoga", "Arishta / Challenging Yogas", "Jupiter conjunct Rahu", "Unorthodox beliefs, conflicts with teachers, ethical confusion.", (x) => x.conj("Jupiter", "Rahu"), "bad"],
  ["Angarak Yoga", "Arishta / Challenging Yogas", "Mars conjunct Rahu", "Anger, accidents, impulsive actions; great energy if channelled.", (x) => x.conj("Mars", "Rahu"), "bad"],
  ["Vish Yoga", "Arishta / Challenging Yogas", "Saturn conjunct Moon", "Melancholy, emotional burdens, delays; deep endurance.", (x) => x.conj("Saturn", "Moon"), "bad"],
  ["Shrapit Yoga", "Arishta / Challenging Yogas", "Saturn conjunct Rahu", "Karmic obstacles, delays and repeated struggles.", (x) => x.conj("Saturn", "Rahu"), "bad"],
  ["Papa Kartari Yoga", "Arishta / Challenging Yogas", "Lagna hemmed between malefics in 2nd and 12th", "Pressured life, obstacles to health and initiatives.", (x) => x.malsIn([2]).length > 0 && x.malsIn([12]).length > 0, "bad"],
  ["Chandra Papa Kartari", "Arishta / Challenging Yogas", "Moon hemmed between malefics", "Mental stress and worry; emotional pressure.", (x) => SEVEN.some((id) => x.isMal(id) && id !== "Moon" && x.fromMoon(id) === 2) && SEVEN.some((id) => x.isMal(id) && id !== "Moon" && x.fromMoon(id) === 12), "bad"],
  ["Duryoga", "Arishta / Challenging Yogas", "10th lord in 6th, 8th or 12th", "Career obstacles, lack of recognition for efforts.", (x) => DUS.includes(x.LH(10)), "bad"],
  ["Lagna Lord in Dusthana", "Arishta / Challenging Yogas", "Lagna lord in 6th, 8th or 12th", "Health issues and struggles; success through service or research.", (x) => DUS.includes(x.LH(1)), "bad"],
];

export function detectYogas(c: ChartData, now = Date.now()): YogaResult[] {
  const x = ctx(c);
  return DEFS.map(([name, category, formation, effect, fn, nature]) => {
    let present = false;
    try {
      present = fn(x);
    } catch {
      present = false;
    }
    const nat = nature ?? "good";
    const r = present ? yogaRemedies(c, name, category, nat, now) : { planets: [], remedies: [], activation: [] };
    return { name, category, formation, effect, present, nature: nat, ...r };
  });
}

/* ---------- Doshas ---------- */
export interface DoshaResult {
  name: string;
  present: boolean;
  severity: "None" | "Mild" | "Moderate" | "Strong";
  details: string;
  planets: PlanetId[];
  remedies: Remedy[];
  activation: string[];
}

const KSY_NAMES = ["Anant", "Kulik", "Vasuki", "Shankhpal", "Padma", "Mahapadma", "Takshak", "Karkotak", "Shankhachood", "Ghatak", "Vishdhar", "Sheshnag"];

type RawDosha = Omit<DoshaResult, "planets" | "remedies" | "activation"> & { remedies: string[] };

const DOSHA_PLANETS: Record<string, (c: ChartData) => PlanetId[]> = {
  "Mangal Dosha (Kuja Dosha)": () => ["Mars"],
  "Kaal Sarp Dosha": () => ["Rahu", "Ketu"],
  "Pitra Dosha": () => ["Sun", "Rahu"],
  "Grahan Dosha": (c) => (["Sun", "Moon"] as PlanetId[]).filter((l) => planet(c, l).sign === planet(c, "Rahu").sign || planet(c, l).sign === planet(c, "Ketu").sign).concat(["Rahu"]),
  "Guru Chandal Dosha": () => ["Jupiter", "Rahu"],
  "Kemadruma Dosha": () => ["Moon"],
  "Shrapit Dosha": () => ["Saturn", "Rahu"],
  "Angarak Dosha": () => ["Mars", "Rahu"],
  "Shani Sade Sati (current)": () => ["Saturn"],
};

const DOSHA_RICH: Record<string, Remedy[]> = {
  "Mangal Dosha (Kuja Dosha)": [
    { kind: "Puja", text: "Mangal Shanti / Bhoomi puja on a Tuesday; for strong dosha, Kumbh Vivah or Vishnu Vivah before marriage" },
    { kind: "Mantra", text: "Hanuman Chalisa daily and \"Om Angarakaya Namah\" 108 times on Tuesdays; Mangal Kavacham" },
    { kind: "Fasting", text: "Mangalvar vrat (Tuesday fast) for 21 consecutive Tuesdays" },
    { kind: "Charity", text: "Donate red lentils (masoor), jaggery, red cloth or copper on Tuesdays; donate blood if possible" },
    { kind: "Gemstone", text: "Red Coral only if Mars is a functional benefic for your Lagna — otherwise avoid" },
    { kind: "Lifestyle", text: "Match with a partner having similar Mangal Dosha; delay marriage beyond 28 if the dosha is strong; channel energy through sport or exercise" },
  ],
  "Kaal Sarp Dosha": [
    { kind: "Puja", text: "Kaal Sarp Shanti puja at Trimbakeshwar (Nashik), Srikalahasti or Ujjain, preferably on Nag Panchami or an Amavasya" },
    { kind: "Mantra", text: "Maha Mrityunjaya mantra 108 times daily; Sarpa Suktam; \"Om Namah Shivaya\"" },
    { kind: "Puja", text: "Rudrabhishek with milk on Mondays; offer a silver Naga-Nagin pair in a Shiva temple" },
    { kind: "Charity", text: "Feed birds and fish; donate black blankets and urad dal on Saturdays" },
    { kind: "Lifestyle", text: "Never harm snakes; keep a peacock feather at home; stay patient — rise usually comes after age 35-42" },
  ],
  "Pitra Dosha": [
    { kind: "Puja", text: "Shraddha and Tarpan during Pitru Paksha every year; Narayan Bali / Tripindi Shraddha at Gaya, Trimbakeshwar or Haridwar" },
    { kind: "Mantra", text: "Pitru Gayatri and \"Om Pitribhyo Namah\"; recite Pitru Stotra on Amavasya" },
    { kind: "Charity", text: "Feed crows, cows, dogs and Brahmins on Amavasya; donate food and clothes in ancestors' names" },
    { kind: "Lifestyle", text: "Pour water to a Peepal tree on Saturdays; respect and serve father and elders; keep ancestors' photos in the south-west" },
  ],
  "Grahan Dosha": [
    { kind: "Mantra", text: "Aditya Hridayam on Sundays (Sun-Rahu) or Chandra Kavacham / \"Om Som Somaya Namah\" on Mondays (Moon-Rahu)" },
    { kind: "Puja", text: "Grahan Dosha Nivaran puja; worship Lord Shiva on Mondays" },
    { kind: "Charity", text: "Donate sesame, blankets, food and silver during solar and lunar eclipses" },
    { kind: "Lifestyle", text: "Meditate during eclipses; avoid major decisions on eclipse days" },
  ],
  "Guru Chandal Dosha": [
    { kind: "Puja", text: "Guru-Rahu shanti puja; Brihaspati puja on Thursdays" },
    { kind: "Mantra", text: "\"Om Gram Greem Graum Sah Gurave Namah\" 108 times on Thursdays; Vishnu Sahasranama" },
    { kind: "Fasting", text: "Thursday fast (Guruvar vrat) with yellow food" },
    { kind: "Charity", text: "Donate turmeric, chana dal, yellow cloth and books to students on Thursdays" },
    { kind: "Lifestyle", text: "Respect teachers, priests and elders; avoid unethical shortcuts and dubious advisors" },
  ],
  "Kemadruma Dosha": [
    { kind: "Puja", text: "Worship Lord Shiva and Goddess Parvati on Mondays; Purnima Satyanarayana puja" },
    { kind: "Mantra", text: "\"Om Shram Shreem Shraum Sah Chandraya Namah\" 108 times on Mondays" },
    { kind: "Fasting", text: "Monday fast (Somvar vrat) or Purnima fast" },
    { kind: "Gemstone", text: "Natural Pearl in silver on the little finger, on a Monday — after consultation" },
    { kind: "Lifestyle", text: "Keep a silver square/coin with you; stay socially connected; respect your mother" },
  ],
  "Shrapit Dosha": [
    { kind: "Puja", text: "Shrapit Dosha Nivaran puja; Shani-Rahu shanti; Rudrabhishek" },
    { kind: "Mantra", text: "Shani Stotra and \"Om Ram Rahave Namah\" on Saturdays; Maha Mrityunjaya daily" },
    { kind: "Charity", text: "Feed crows and dogs; donate black sesame, mustard oil, iron and blankets on Saturdays" },
    { kind: "Lifestyle", text: "Serve labourers and the elderly; avoid cheating, intoxicants and shortcuts" },
  ],
  "Angarak Dosha": [
    { kind: "Puja", text: "Angarak (Mangal-Rahu) shanti puja, ideally at Mangalnath temple, Ujjain" },
    { kind: "Mantra", text: "Hanuman Chalisa daily; \"Om Kram Kreem Kraum Sah Bhaumaya Namah\" on Tuesdays" },
    { kind: "Charity", text: "Donate red lentils, jaggery and red cloth on Tuesdays" },
    { kind: "Lifestyle", text: "Control anger; avoid rash driving, fire and sharp tools; regular physical exercise" },
  ],
  "Shani Sade Sati (current)": [
    { kind: "Puja", text: "Light a sesame oil lamp under a Peepal tree and at a Shani temple on Saturdays" },
    { kind: "Mantra", text: "Hanuman Chalisa and Shani Chalisa on Saturdays; \"Om Sham Shanaishcharaya Namah\" 108 times" },
    { kind: "Fasting", text: "Saturday fast (Shanivar vrat)" },
    { kind: "Charity", text: "Donate black sesame, mustard oil, iron, shoes and blankets to the poor on Saturdays" },
    { kind: "Gemstone", text: "Blue Sapphire only if Saturn is a functional benefic and after a trial — otherwise wear an iron (horseshoe) ring on the middle finger" },
    { kind: "Lifestyle", text: "Work hard, be honest and patient; serve the elderly and workers — Saturn rewards discipline" },
  ],
};

function enrichDosha(c: ChartData, d: RawDosha, now: number): DoshaResult {
  const planets = DOSHA_PLANETS[d.name]?.(c) ?? [];
  const base = DOSHA_RICH[d.name] ?? d.remedies.map((t) => ({ kind: "Lifestyle" as const, text: t }));
  const plan = planets.flatMap((id) => planetRemedies(c, id, "pacify").slice(0, 1));
  const activation = d.severity === "None" ? [] : activationPeriods(c, planets, now, 3);
  const timing: Remedy[] = activation.length ? [{ kind: "Timing", text: `Effects peak in ${activation.map((a) => a.split(" · ")[0]).join("; ")} — intensify remedies then` }] : [];
  return { ...d, planets, remedies: dedupe([...base, ...plan, ...timing]), activation };
}

export function detectDoshas(c: ChartData, transits?: Record<PlanetId, number>, now = Date.now()): DoshaResult[] {
  const x = ctx(c);
  const out: RawDosha[] = [];
  // Mangal
  const mh = [1, 2, 4, 7, 8, 12];
  const fromL = mh.includes(x.H("Mars"));
  const fromM = mh.includes(x.fromMoon("Mars"));
  const fromV = mh.includes(x.from("Venus", "Mars"));
  const cancel: string[] = [];
  if ([0, 7, 9].includes(x.S("Mars"))) cancel.push("Mars in own/exaltation sign (Aries, Scorpio, Capricorn)");
  if (x.aspects("Jupiter", "Mars") || x.conj("Jupiter", "Mars")) cancel.push("Jupiter aspects/joins Mars");
  if (x.H("Mars") === 2 && [2, 5].includes(x.S("Mars"))) cancel.push("Mars in 2nd in Gemini/Virgo");
  if (x.H("Mars") === 4 && [0, 7].includes(x.S("Mars"))) cancel.push("Mars in 4th in own sign");
  const count = [fromL, fromM, fromV].filter(Boolean).length;
  out.push({
    name: "Mangal Dosha (Kuja Dosha)",
    present: count > 0 && cancel.length === 0,
    severity: count === 0 ? "None" : cancel.length ? "Mild" : count >= 2 ? "Strong" : "Moderate",
    details: count === 0 ? "Mars is not in 1, 2, 4, 7, 8 or 12 from Lagna, Moon or Venus. No Mangal Dosha." : `Mars in house ${x.H("Mars")} from Lagna${fromM ? `, ${x.fromMoon("Mars")} from Moon` : ""}${fromV ? `, ${x.from("Venus", "Mars")} from Venus` : ""}. ${cancel.length ? "Cancelled / reduced by: " + cancel.join("; ") + "." : "No cancellation found — consider matching with a Manglik partner."}`,
    remedies: ["Recite Hanuman Chalisa on Tuesdays", "Kumbh Vivah / Mangal Shanti puja before marriage", "Donate red lentils and jaggery on Tuesdays", "Marry a partner with matching Mangal Dosha"],
  });
  // Kaal Sarp
  const r = x.P("Rahu").lon;
  const side = (lon: number) => ((lon - r + 360) % 360) < 180;
  const sides = SEVEN.map((id) => side(x.P(id).lon));
  const ksy = sides.every((s) => s) || sides.every((s) => !s);
  const partial = !ksy && (sides.filter((s) => s).length === 6 || sides.filter((s) => !s).length === 6);
  out.push({
    name: "Kaal Sarp Dosha",
    present: ksy,
    severity: ksy ? "Strong" : partial ? "Mild" : "None",
    details: ksy ? `All seven planets are hemmed between Rahu and Ketu — ${KSY_NAMES[x.H("Rahu") - 1]} Kaal Sarp (Rahu in house ${x.H("Rahu")}). Brings delays and struggle in early life, followed by sudden rise.` : partial ? "Partial Kaal Sarp — six planets on one side of the Rahu-Ketu axis. Effects are mild." : "Planets are spread on both sides of the Rahu–Ketu axis. No Kaal Sarp Dosha.",
    remedies: ["Kaal Sarp Shanti puja at Trimbakeshwar or Srikalahasti", "Recite Maha Mrityunjaya mantra", "Worship Lord Shiva with milk on Mondays", "Offer silver Naga-Nagin pair in a Shiva temple"],
  });
  // Pitra
  const pitra = x.conj("Sun", "Rahu") || x.conj("Sun", "Saturn") || x.inH(9).some((id) => ["Rahu", "Saturn"].includes(id)) || x.conj(x.L(9), "Rahu");
  out.push({ name: "Pitra Dosha", present: pitra, severity: pitra ? "Moderate" : "None", details: pitra ? "Sun or the 9th house / 9th lord is afflicted by Rahu or Saturn — indicates ancestral karmic debts, obstacles in progress and father-related issues." : "Sun and the 9th house are free from Rahu/Saturn affliction. No Pitra Dosha.", remedies: ["Perform Shraddha and Tarpan during Pitru Paksha", "Feed crows, cows and Brahmins on Amavasya", "Pour water to a Peepal tree on Saturdays", "Narayan Bali puja"] });
  // Grahan
  const grahan = x.conj("Sun", "Rahu") || x.conj("Sun", "Ketu") || x.conj("Moon", "Rahu") || x.conj("Moon", "Ketu");
  out.push({ name: "Grahan Dosha", present: grahan, severity: grahan ? "Moderate" : "None", details: grahan ? "A luminary is conjunct a lunar node — the light of the Sun (confidence) or Moon (mind) is eclipsed." : "Sun and Moon are free from the nodes. No Grahan Dosha.", remedies: ["Recite Aditya Hridayam / Chandra mantra", "Donate during eclipses", "Worship Lord Shiva"] });
  // Guru Chandal
  const gc = x.conj("Jupiter", "Rahu") || x.conj("Jupiter", "Ketu");
  out.push({ name: "Guru Chandal Dosha", present: gc, severity: gc ? "Moderate" : "None", details: gc ? "Jupiter joins a node — can distort wisdom, create conflicts with gurus or unorthodox beliefs." : "Jupiter is free from the nodes.", remedies: ["Respect teachers and elders", "Worship Lord Vishnu on Thursdays", "Donate yellow items and turmeric"] });
  // Kemadruma
  const kem = !SEVEN.some((id) => id !== "Sun" && id !== "Moon" && [1, 2, 12].includes(x.fromMoon(id)));
  const kemCancel = SEVEN.some((id) => id !== "Moon" && KEN.includes(x.H(id))) || KEN.includes(x.fromMoon("Jupiter"));
  out.push({ name: "Kemadruma Dosha", present: kem && !kemCancel, severity: !kem ? "None" : kemCancel ? "Mild" : "Strong", details: !kem ? "Moon is supported by planets in adjacent houses. No Kemadruma." : kemCancel ? "Moon lacks adjacent planets, but the dosha is cancelled by planets in Kendras." : "Moon is isolated — emotional loneliness and financial fluctuation.", remedies: ["Worship Goddess Parvati / Lord Shiva on Mondays", "Wear pearl after consultation", "Keep a silver square with you"] });
  // Shrapit
  const sh = x.conj("Saturn", "Rahu");
  out.push({ name: "Shrapit Dosha", present: sh, severity: sh ? "Moderate" : "None", details: sh ? "Saturn and Rahu together — karmic curse from past life bringing delays." : "Saturn and Rahu are not conjunct.", remedies: ["Shrapit Dosha Nivaran puja", "Recite Shani and Rahu mantras", "Serve the needy on Saturdays"] });
  // Angarak
  const an = x.conj("Mars", "Rahu") || x.conj("Mars", "Ketu");
  out.push({ name: "Angarak Dosha", present: an, severity: an ? "Moderate" : "None", details: an ? "Mars joins a node — excessive anger, accidents and conflicts." : "Mars is free from the nodes.", remedies: ["Hanuman worship on Tuesdays", "Mangal-Rahu shanti puja", "Avoid rash driving"] });
  // Sade Sati
  if (transits) {
    const sat = Math.floor(transits.Saturn / 30);
    const h = houseFrom(x.S("Moon"), sat);
    const ss = [12, 1, 2].includes(h);
    const dhaiya = [4, 8].includes(h);
    const phase = h === 12 ? "Rising (first) phase" : h === 1 ? "Peak (second) phase" : h === 2 ? "Setting (final) phase" : "";
    out.push({ name: "Shani Sade Sati (current)", present: ss || dhaiya, severity: ss ? (h === 1 ? "Strong" : "Moderate") : dhaiya ? "Mild" : "None", details: ss ? `Transit Saturn is in ${SIGNS[sat].en}, the ${h === 1 ? "same sign as" : h === 12 ? "12th from" : "2nd from"} your Moon sign — ${phase} of Sade Sati. A period of hard work, restructuring and karmic lessons.` : dhaiya ? `Transit Saturn in ${SIGNS[sat].en} is ${h}th from Moon — Shani Dhaiya (Kantaka/Ashtama Shani) is running.` : `Transit Saturn is in ${SIGNS[sat].en}, ${h}th from your Moon sign. Sade Sati is not active now.`, remedies: ["Light a sesame oil lamp under a Peepal tree on Saturdays", "Recite Shani Chalisa / Hanuman Chalisa", "Serve elderly and labourers", "Donate black sesame and iron"] });
  }
  return out.map((d) => enrichDosha(c, d, now));
}

export { dignity };

/* ---------- Combined remedy plan ---------- */
export interface PlanEntry {
  id: PlanetId;
  reasons: string[];
  mantra: string;
  day: string;
  deity: string;
  gem: string;
  charity: string;
}

export function remedyPlan(c: ChartData, yogas: YogaResult[], doshas: DoshaResult[]) {
  const strengthen = new Map<PlanetId, string[]>();
  const pacify = new Map<PlanetId, string[]>();
  const add = (m: Map<PlanetId, string[]>, id: PlanetId, why: string) => m.set(id, [...(m.get(id) ?? []), why]);
  for (const y of yogas.filter((v) => v.present)) {
    for (const id of y.planets.slice(0, 3)) add(y.nature === "bad" ? pacify : strengthen, id, y.name);
  }
  for (const d of doshas.filter((v) => v.present)) for (const id of d.planets) add(pacify, id, d.name);
  const entry = (id: PlanetId, reasons: string[], mode: "strengthen" | "pacify"): PlanEntry => {
    const pi = PLANET_INFO[id];
    const gemR = planetRemedies(c, id, "strengthen").find((r) => r.kind === "Gemstone");
    return { id, reasons: Array.from(new Set(reasons)), mantra: pi.mantra, day: pi.day, deity: WORSHIP[id], gem: mode === "pacify" ? `Avoid strengthening with ${pi.gem}; use mantra and charity` : gemR?.text ?? pi.gem, charity: `${pi.grain} on ${pi.day}s` };
  };
  const s = [...strengthen.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 4).map(([id, r]) => entry(id, r, "strengthen"));
  const p = [...pacify.entries()].sort((a, b) => b[1].length - a[1].length).map(([id, r]) => entry(id, r, "pacify"));
  return { strengthen: s, pacify: p };
}
