import { BHAVAS, PLANET_INFO, SIGNS, type PlanetId } from "./data";
import { subPeriods, YEAR_MS, type ChartData, type DashaPeriod } from "./calc";
import { dedupe, planetRemedies, WORSHIP, type Remedy } from "./remedies";
import { charaKarakas, dignity, functionalNature, houseFrom, houseLord, housesOwned, planet, planetsInHouse, relationTo } from "./analysis";

const THEMES: Record<PlanetId, { good: string; bad: string; areas: string }> = {
  Sun: { good: "recognition, authority, government favour, confidence and support from father or seniors", bad: "ego clashes, conflicts with authority, eye/heart strain and strained relations with father", areas: "career status, leadership, government matters, father and health" },
  Moon: { good: "emotional fulfilment, popularity, travel, comforts, support from mother and gains through the public", bad: "mood swings, anxiety, fluctuating finances and worries about mother's health", areas: "mind, home, mother, public dealings and travel" },
  Mars: { good: "courage, property gains, victories over rivals, technical success and physical vitality", bad: "anger, accidents, disputes over land, surgery risks and conflicts with siblings", areas: "property, siblings, competition, energy and technical work" },
  Mercury: { good: "learning, business growth, communication success, new skills, writing and profitable trade", bad: "nervous stress, miscommunication, skin issues and wrong commercial decisions", areas: "education, business, communication, friends and intellect" },
  Jupiter: { good: "wisdom, expansion, wealth, children, marriage, spiritual growth and guidance from teachers", bad: "over-confidence, weight gain, liver issues, misplaced trust and religious conflicts", areas: "wealth, children, higher learning, dharma and marriage" },
  Venus: { good: "romance, marriage, luxury, vehicles, artistic success, comforts and beauty", bad: "over-indulgence, relationship turbulence, kidney/reproductive issues and extravagance", areas: "relationships, marriage, luxuries, arts and vehicles" },
  Saturn: { good: "steady progress through discipline, long-term stability, property, authority over people and maturity", bad: "delays, hard labour, depression, chronic ailments, losses and separation", areas: "career discipline, karma, longevity, servants and responsibilities" },
  Rahu: { good: "sudden rise, foreign connections, technology, political gains and unconventional success", bad: "confusion, deception, addictions, scandals, sudden losses and anxiety", areas: "ambition, foreign lands, technology, sudden events and illusions" },
  Ketu: { good: "spiritual insight, research breakthroughs, detachment, healing ability and liberation", bad: "confusion, isolation, sudden separations, mysterious health issues and loss of direction", areas: "spirituality, research, detachment and past karma" },
};

export interface DashaPrediction {
  title: string;
  status: "past" | "current" | "future";
  rating: number;
  summary: string;
  events: string[];
  favourable: string[];
  challenges: string[];
  todo: string[];
  avoid: string[];
  houses: string[];
  lifeAreas: { area: string; icon: string; tone: "good" | "bad" | "mixed"; text: string }[];
  remedies: Remedy[];
  lord: PlanetId;
}

const AREA: Record<number, { area: string; icon: string; good: string; bad: string }> = {
  1: { area: "Health & Self", icon: "🧘", good: "vitality, confidence and recognition of your personality", bad: "health strain, low energy and self-doubt" },
  2: { area: "Finance & Family", icon: "💰", good: "savings, family harmony and sweet speech", bad: "expenses within family, harsh speech or dental/eye issues" },
  3: { area: "Courage & Communication", icon: "📣", good: "bold initiatives, short travels, writing and support from siblings", bad: "conflicts with siblings, nervous restlessness and wasted effort" },
  4: { area: "Home & Property", icon: "🏡", good: "property, vehicles, domestic peace and mother's blessings", bad: "domestic unrest, relocation, property disputes or mother's health concerns" },
  5: { area: "Education & Children", icon: "🎓", good: "learning, creativity, romance, children's progress and wise decisions", bad: "study obstacles, worries about children and speculative losses" },
  6: { area: "Health & Competition", icon: "⚔️", good: "victory over rivals, success in exams/jobs and debt clearance", bad: "illness, disputes, litigation, debts and workplace friction" },
  7: { area: "Marriage & Partnerships", icon: "💞", good: "marriage, partnership gains and public dealings", bad: "relationship friction, partner's health or business disputes" },
  8: { area: "Transformation", icon: "🔮", good: "inheritance, research breakthroughs and occult insight", bad: "sudden changes, accidents, chronic health issues and hidden enemies" },
  9: { area: "Fortune & Dharma", icon: "🍀", good: "luck, higher studies, long journeys, guru's and father's blessings", bad: "lack of luck, differences with father or teachers" },
  10: { area: "Career & Status", icon: "💼", good: "promotion, new job, authority and public recognition", bad: "career instability, conflicts with bosses and reputation issues" },
  11: { area: "Gains & Network", icon: "📈", good: "income growth, fulfilment of wishes and helpful friends", bad: "delayed gains and unreliable friends" },
  12: { area: "Expenses & Foreign", icon: "✈️", good: "foreign travel, spiritual growth and charitable expenses", bad: "heavy expenses, losses, sleep problems and isolation" },
};


function tense(status: DashaPrediction["status"]) {
  return status === "past" ? { bring: "brought", be: "was", mayBring: "may have brought", focus: "focused" } : status === "current" ? { bring: "brings", be: "is", mayBring: "may bring", focus: "focuses" } : { bring: "will bring", be: "will be", mayBring: "may bring", focus: "will focus" };
}

function lordScore(c: ChartData, id: PlanetId) {
  const p = planet(c, id);
  const d = dignity(id, p.sign, p.deg, c);
  let s = 3;
  if (["Exalted", "Moolatrikona", "Own Sign"].includes(d)) s += 1;
  if (d === "Debilitated") s -= 1;
  if (d === "Enemy's Sign") s -= 0.5;
  if (d === "Great Enemy's Sign") s -= 0.8;
  if (d === "Great Friend's Sign") s += 0.3;
  if ([1, 4, 5, 7, 9, 10, 11].includes(p.house)) s += 0.5;
  if ([6, 8, 12].includes(p.house)) s -= 0.7;
  if (functionalNature(c, id).good) s += 0.5;
  else s -= 0.5;
  if (p.combust) s -= 0.4;
  return { s, d, p };
}

export function dashaPrediction(c: ChartData, chain: PlanetId[], period: DashaPeriod, now = Date.now()): DashaPrediction {
  const status: DashaPrediction["status"] = period.end < now ? "past" : period.start > now ? "future" : "current";
  const t = tense(status);
  const levels = ["Mahadasha", "Antardasha", "Pratyantar Dasha"];
  const lord = chain[chain.length - 1];
  const { s, d, p } = lordScore(c, lord);
  let rating = s;
  const owned = housesOwned(c, lord);
  const houseNames = [p.house, ...owned].filter((v, i, a) => a.indexOf(v) === i).map((h) => `H${h} ${BHAVAS[h - 1].title}`);
  const th = THEMES[lord];
  const events: string[] = [];
  const favourable: string[] = [];
  const challenges: string[] = [];

  events.push(`${lord} ${t.be} placed in house ${p.house} (${BHAVAS[p.house - 1].title}), so this period ${t.focus} strongly on ${BHAVAS[p.house - 1].significations.split(",").slice(0, 5).join(",").toLowerCase()}.`);
  if (owned.length) events.push(`As lord of house${owned.length > 1 ? "s" : ""} ${owned.join(" & ")}, ${lord} ${t.bring} results related to ${owned.map((h) => BHAVAS[h - 1].title.toLowerCase()).join("; ")}.`);

  let relText = "";
  if (chain.length > 1) {
    const parent = chain[chain.length - 2];
    const rel = relationTo(parent, lord);
    const pos = houseFrom(planet(c, parent).sign, p.sign);
    if (rel === "Friend") rating += 0.4;
    if (rel === "Enemy") rating -= 0.4;
    if ([6, 8, 12].includes(pos)) rating -= 0.5;
    if ([1, 4, 5, 7, 9, 10, 11].includes(pos)) rating += 0.3;
    relText = ` ${lord} is ${rel === "Self" ? "the same as" : `${rel === "Enemy" ? "an" : "a"} ${rel.toLowerCase()} of`} ${parent} and ${pos === 1 ? "occupies the same sign" : `sits ${pos}${pos === 2 ? "nd" : pos === 3 ? "rd" : "th"} from it`} — ${[6, 8, 12].includes(pos) ? "a tense placement that creates friction between the two agendas" : [1, 5, 9, 4, 7, 10].includes(pos) ? "a harmonious placement that lets them cooperate" : "a workable placement"}.`;
    events.push(`Within the ${parent} period, ${lord} ${t.bring} a sub-theme of ${th.areas}.`);
  }
  rating = Math.max(1, Math.min(5, rating));
  const goodPeriod = rating >= 3;

  if (goodPeriod) {
    favourable.push(`${lord} ${t.bring} ${th.good}.`);
    owned.forEach((h) => { if ([1, 2, 4, 5, 7, 9, 10, 11].includes(h)) favourable.push(`Progress in ${BHAVAS[h - 1].title.toLowerCase()} (house ${h}).`); });
    challenges.push(`Minor issues: ${th.bad.split(",").slice(0, 2).join(" and")}.`);
  } else {
    challenges.push(`${lord} ${t.mayBring} ${th.bad}.`);
    owned.forEach((h) => { if ([6, 8, 12].includes(h)) challenges.push(`Matters of ${BHAVAS[h - 1].title.toLowerCase()} (house ${h}) ${status === "past" ? "were" : "are"} highlighted.`); });
    favourable.push(`Still, sincere effort ${t.bring} some ${th.good.split(",").slice(0, 2).join(" and")}.`);
  }
  if (d === "Exalted" || d === "Moolatrikona" || d === "Own Sign") favourable.push(`${lord} is ${d.toLowerCase()} — results are strong and dependable.`);
  if (d === "Debilitated") challenges.push(`${lord} is debilitated — results come after struggle; remedies are highly recommended.`);
  if (p.retro && !["Rahu", "Ketu"].includes(lord)) events.push(`${lord} is retrograde — expect revisiting old matters, delays and internal reflection.`);
  if (p.combust) challenges.push(`${lord} is combust (too close to the Sun) — its significations may feel weakened or overshadowed.`);
  const kar = charaKarakas(c)[lord];
  if (kar) events.push(`${lord} is your ${kar} — ${kar === "AK" ? "a soul-defining period" : kar === "AmK" ? "career decisions become central" : kar === "DK" ? "spouse/partnerships come into focus" : kar === "PK" || kar === "PiK" ? "father and elders are highlighted" : kar === "MK" ? "mother, home and property are highlighted" : kar === "BK" ? "siblings and courage are highlighted" : "rivals and health need attention"}.`);

  const pi = PLANET_INFO[lord];
  const title = chain.join(" → ") + ` ${levels[chain.length - 1]}`;
  const summary = `${levels[chain.length - 1]} of ${lord} (${pi.sa}) in ${SIGNS[p.sign].en}, house ${p.house}. Overall this ${status === "past" ? "was" : status === "current" ? "is" : "will be"} a ${rating >= 4 ? "highly favourable" : rating >= 3 ? "favourable" : rating >= 2 ? "mixed" : "challenging"} period.${relText}`;
  return {
    title,
    status,
    rating: Math.round(rating * 10) / 10,
    summary,
    events,
    favourable,
    challenges,
    todo: pi.remedies,
    avoid: pi.avoid,
    houses: houseNames,
    lifeAreas: lifeAreas(c, lord, rating, status),
    remedies: dashaRemedies(c, chain, rating),
    lord,
  };
}

function lifeAreas(c: ChartData, lord: PlanetId, rating: number, status: DashaPrediction["status"]): DashaPrediction["lifeAreas"] {
  const p = planet(c, lord);
  const hs = [p.house, ...housesOwned(c, lord)].filter((v, i, a) => a.indexOf(v) === i);
  if (lord === "Rahu" || lord === "Ketu") hs.push(((SIGNS[p.sign].lord && planet(c, SIGNS[p.sign].lord).house) || p.house));
  const verb = status === "past" ? "brought" : status === "current" ? "brings" : "will bring";
  const mayV = status === "past" ? "may have brought" : "may bring";
  return Array.from(new Set(hs)).map((h) => {
    const a = AREA[h];
    const dus = [6, 8, 12].includes(h);
    let tone: "good" | "bad" | "mixed" = rating >= 3.3 ? "good" : rating < 2.4 ? "bad" : "mixed";
    if (dus && tone === "good" && !["Mars", "Saturn", "Rahu", "Sun"].includes(lord)) tone = "mixed";
    const text = tone === "good" ? `This period ${verb} ${a.good}.` : tone === "bad" ? `This period ${mayV} ${a.bad}. Patience and remedies help.` : `Mixed results: ${a.good}, but also ${a.bad.split(",")[0]}.`;
    return { area: a.area, icon: a.icon, tone, text: `${text} (house ${h}${h === p.house ? ", placement" : ", lordship"})` };
  });
}

function dashaRemedies(c: ChartData, chain: PlanetId[], rating: number): Remedy[] {
  const lord = chain[chain.length - 1];
  const pi = PLANET_INFO[lord];
  const mode = rating >= 3 && functionalNature(c, lord).good ? "strengthen" : "pacify";
  const out: Remedy[] = [...planetRemedies(c, lord, mode)];
  pi.remedies.forEach((r) => out.push({ kind: /donate|feed/i.test(r) ? "Charity" : /recite|worship|offer|chant/i.test(r) ? "Puja" : "Lifestyle", text: r }));
  if (!pi.remedies.some((r) => /worship/i.test(r))) out.push({ kind: "Puja", text: `Worship ${WORSHIP[lord]} on ${pi.day}s` });
  out.push({ kind: "Fasting", text: `Observe a fast or eat simple sattvic food on ${pi.day}s during this period` });
  if (chain.length > 1) {
    const parent = chain[chain.length - 2];
    if (parent !== lord) out.push({ kind: "Mantra", text: `Also keep the parent period lord ${parent} pleased: "${PLANET_INFO[parent].mantra}" on ${PLANET_INFO[parent].day}s` });
  }
  out.push({ kind: "Lifestyle", text: `Wear ${pi.color2.toLowerCase()} on ${pi.day}s; face ${pi.direction} during prayers; lucky number ${pi.number}` });
  return dedupe(out);
}

/* ---------- overall predictions ---------- */
const CAREERS: Record<PlanetId, string> = {
  Sun: "government service, administration, politics, medicine, management and leadership roles",
  Moon: "hospitality, nursing, food & dairy, shipping, public relations, psychology and import-export",
  Mars: "engineering, defence, police, surgery, sports, real estate and manufacturing",
  Mercury: "IT & software, accounting, writing, media, trading, teaching and communication",
  Jupiter: "teaching, law, banking & finance, advisory, consulting, religion and counselling",
  Venus: "arts, entertainment, fashion, design, luxury goods, beauty, hospitality and diplomacy",
  Saturn: "construction, mining, oil, judiciary, labour management, manufacturing and social service",
  Rahu: "technology, aviation, foreign trade, research, politics, pharmaceuticals and digital media",
  Ketu: "research, programming, spirituality, occult sciences, alternative healing and mathematics",
};

export interface PredictionSection {
  key: string;
  title: string;
  icon: string;
  paragraphs: string[];
  timing?: string[];
}

const lc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

function fmtDate(ms: number) {
  return new Date(ms).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
}

function periodsFor(c: ChartData, lords: PlanetId[], minAge: number, maxAge: number) {
  const birth = new Date(c.utc).getTime();
  const out: string[] = [];
  for (const md of c.dashas) {
    for (const ad of subPeriods(md)) {
      const age = (ad.start - birth) / YEAR_MS;
      if (age < minAge || age > maxAge) continue;
      if (lords.includes(ad.lord) || lords.includes(md.lord)) {
        if (lords.includes(ad.lord)) out.push(`${md.lord}–${ad.lord}: ${fmtDate(ad.start)} → ${fmtDate(ad.end)} (age ${Math.floor(age)})`);
      }
    }
  }
  return out.slice(0, 6);
}

export function overallPredictions(c: ChartData, now = Date.now()): PredictionSection[] {
  const asc = SIGNS[c.asc.sign];
  const ll = asc.lord;
  const llp = planet(c, ll);
  const moon = planet(c, "Moon");
  const sun = planet(c, "Sun");
  const birth = new Date(c.utc).getTime();
  const cur = c.dashas.find((d) => d.start <= now && d.end > now);
  const past = c.dashas.filter((d) => d.end <= now);
  const future = c.dashas.filter((d) => d.start > now).slice(0, 3);
  const curAd = cur ? subPeriods(cur).find((d) => d.start <= now && d.end > now) : undefined;
  const k = charaKarakas(c);
  const find = (kk: string) => (Object.keys(k) as PlanetId[]).find((id) => k[id] === kk)!;
  const names = (h: number) => planetsInHouse(c, h).map((p) => p.id);
  const sections: PredictionSection[] = [];

  sections.push({
    key: "personality",
    title: "Personality & Life Path (D1)",
    icon: "✦",
    paragraphs: [
      `With ${asc.en} (${asc.sa}) rising, you are ${lc(asc.archetype)} Your Lagna lord ${ll} sits in house ${llp.house} (${BHAVAS[llp.house - 1].title.toLowerCase()}), so life repeatedly draws you towards these matters — ${BHAVAS[llp.house - 1].significations.split(",").slice(0, 4).join(",").toLowerCase()}.`,
      `Your Moon in ${SIGNS[moon.sign].en} shapes the mind: ${lc(SIGNS[moon.sign].archetype)} The Sun in ${SIGNS[sun.sign].en} (house ${sun.house}) describes your soul's purpose and where you seek recognition.`,
      names(1).length ? `Planets in your Lagna (${names(1).join(", ")}) strongly colour your personality and appearance.` : `An empty Lagna means your Lagna lord ${ll} is the main indicator of your personality and health.`,
    ],
  });

  const pastText = past.length
    ? `Past: ${past.map((d) => `${d.lord} Mahadasha (${fmtDate(Math.max(d.start, birth))} – ${fmtDate(d.end)})`).join(", ")}. ${past.map((d) => `The ${d.lord} years ${THEMES[d.lord].areas.split(",")[0] ? `emphasised ${THEMES[d.lord].areas}` : ""}`).join(". ")}.`
    : "You are still in your first Mahadasha since birth.";
  sections.push({
    key: "timeline",
    title: "Past, Present & Future",
    icon: "⏳",
    paragraphs: [
      pastText,
      cur ? `Present: You are running ${cur.lord} Mahadasha (${fmtDate(cur.start)} – ${fmtDate(cur.end)})${curAd ? ` with ${curAd.lord} Antardasha until ${fmtDate(curAd.end)}` : ""}. ${dashaPrediction(c, curAd ? [cur.lord, curAd.lord] : [cur.lord], curAd ?? cur, now).summary}` : "",
      future.length ? `Future: ${future.map((d) => `${d.lord} Mahadasha from ${fmtDate(d.start)} ${lordScore(c, d.lord).s >= 3 ? "looks favourable, bringing " + THEMES[d.lord].good.split(",").slice(0, 3).join(",") : "will need care; it may test you with " + THEMES[d.lord].bad.split(",").slice(0, 2).join(" and")}`).join(". ")}.` : "",
    ].filter(Boolean),
  });

  const l10 = houseLord(c, 10);
  const l10p = planet(c, l10);
  const d10Asc = SIGNS[c.asc.d10];
  const d10Lord = d10Asc.lord;
  const amk = find("AmK");
  const careerPlanets = Array.from(new Set([l10, ...names(10), d10Lord, amk])) as PlanetId[];
  sections.push({
    key: "career",
    title: "Career & Profession (D1 + D10)",
    icon: "💼",
    paragraphs: [
      `The 10th house falls in ${SIGNS[(c.asc.sign + 9) % 12].en}, ruled by ${l10} placed in house ${l10p.house} (${dignity(l10, l10p.sign, l10p.deg, c)}). ${[1, 4, 5, 7, 9, 10, 11].includes(l10p.house) ? "This is a strong placement for career growth and recognition." : [6, 8, 12].includes(l10p.house) ? "This placement indicates a career involving service, research, foreign lands or behind-the-scenes work, with success coming after obstacles." : "Career grows steadily through personal effort and communication."}`,
      names(10).length ? `Planets in the 10th (${names(10).join(", ")}) make career highly visible in your life.` : "No planets occupy the 10th; the 10th lord and D10 chart become the main career indicators.",
      `In the Dasamsa (D10), ${d10Asc.en} rises with lord ${d10Lord} — ${planet(c, d10Lord).d10 === c.asc.d10 || [0, 3, 6, 9, 4, 8].includes((planet(c, d10Lord).d10 - c.asc.d10 + 12) % 12) ? "well placed, promising professional stability and advancement" : "its placement suggests career changes before stability"}. Your Amatyakaraka (career significator) is ${amk}.`,
      `Suitable fields: ${careerPlanets.map((id) => CAREERS[id]).slice(0, 3).join("; ")}.`,
    ],
    timing: periodsFor(c, [l10, amk, d10Lord], 18, 60).length ? periodsFor(c, [l10, amk, d10Lord], 18, 60) : undefined,
  });

  const l7 = houseLord(c, 7);
  const l7p = planet(c, l7);
  const ven = planet(c, "Venus");
  const dk = find("DK");
  const d9Asc = SIGNS[c.asc.d9];
  const d9l7 = SIGNS[(c.asc.d9 + 6) % 12].lord;
  const mangal = [1, 2, 4, 7, 8, 12].includes(planet(c, "Mars").house);
  sections.push({
    key: "partner",
    title: "Marriage & Life Partner (D1 + D9)",
    icon: "💞",
    paragraphs: [
      `The 7th house is ${SIGNS[(c.asc.sign + 6) % 12].en}; its lord ${l7} is in house ${l7p.house}. ${[1, 4, 5, 7, 9, 10, 11].includes(l7p.house) ? "This favours a supportive, capable partner and a stable marriage." : [6, 8, 12].includes(l7p.house) ? "This can delay marriage or require adjustment; patience and communication are key." : "Marriage comes through personal initiative, travel or friends."} ${names(7).length ? `Planets in the 7th (${names(7).join(", ")}) describe the spouse's nature strongly.` : ""}`,
      `Venus (karaka of love) is in ${SIGNS[ven.sign].en} (${dignity("Venus", ven.sign, ven.deg, c)}), house ${ven.house}. Your Darakaraka is ${dk}, indicating a partner with ${PLANET_INFO[dk].karaka.toLowerCase()} qualities.`,
      `In the Navamsa (D9), ${d9Asc.en} rises and the 7th lord of D9 is ${d9l7}. The D9 shows the inner quality of marriage and the second half of life; ${[0, 3, 4, 6, 8, 9].includes((planet(c, d9l7).d9 - c.asc.d9 + 12) % 12) ? "it is well supported, promising lasting companionship" : "some karmic lessons in partnership are indicated, which mature with time"}.`,
      mangal ? "Mars occupies a Manglik house from the Lagna — see the Dosha section for cancellation details." : "Mars is not in a Manglik house from the Lagna.",
    ],
    timing: periodsFor(c, [l7, "Venus", dk], 20, 40),
  });

  const l5 = houseLord(c, 5);
  const l5p = planet(c, l5);
  const jup = planet(c, "Jupiter");
  sections.push({
    key: "children",
    title: "Children & Progeny",
    icon: "👶",
    paragraphs: [
      `The 5th house is ${SIGNS[(c.asc.sign + 4) % 12].en}, ruled by ${l5} in house ${l5p.house}. ${[1, 4, 5, 7, 9, 10, 11].includes(l5p.house) ? "This is supportive for progeny and children who bring pride." : "Children may come after some delay or effort; remedies for Jupiter help."} ${names(5).length ? `Planets in the 5th: ${names(5).join(", ")}.` : ""}`,
      `Jupiter (putra karaka) is in ${SIGNS[jup.sign].en}, house ${jup.house} (${dignity("Jupiter", jup.sign, jup.deg, c)}). ${["Exalted", "Own Sign", "Moolatrikona"].includes(dignity("Jupiter", jup.sign, jup.deg, c)) ? "A strong Jupiter blesses with intelligent, virtuous children." : "Worship of Jupiter strengthens the blessings of children."}`,
    ],
    timing: periodsFor(c, [l5, "Jupiter"], 22, 42),
  });

  const l2 = houseLord(c, 2);
  const l11 = houseLord(c, 11);
  sections.push({
    key: "wealth",
    title: "Wealth & Finance",
    icon: "💰",
    paragraphs: [
      `2nd lord ${l2} (savings) is in house ${planet(c, l2).house} and 11th lord ${l11} (income) is in house ${planet(c, l11).house}. ${[1, 2, 5, 9, 10, 11].includes(planet(c, l11).house) ? "Income flows well and gains grow with age." : "Income requires sustained effort; avoid speculation during weak periods."}`,
      `${names(2).length ? `Planets in the 2nd (${names(2).join(", ")}) influence family wealth and speech. ` : ""}${names(11).length ? `Planets in the 11th (${names(11).join(", ")}) boost gains and networks.` : ""}`,
    ].filter((s) => s.trim()),
    timing: periodsFor(c, [l2, l11], 18, 70),
  });

  const l6 = houseLord(c, 6);
  sections.push({
    key: "health",
    title: "Health & Vitality",
    icon: "🩺",
    paragraphs: [
      `Lagna lord ${ll} in ${SIGNS[llp.sign].en} (${dignity(ll, llp.sign, llp.deg, c)}) indicates ${["Exalted", "Own Sign", "Moolatrikona", "Great Friend's Sign", "Friend's Sign"].includes(dignity(ll, llp.sign, llp.deg, c)) ? "good natural vitality and recovery power" : "a constitution that needs mindful routine and care"}. Sensitive body areas: ${asc.body.toLowerCase()} and ${BHAVAS[5].body.toLowerCase()}.`,
      `6th lord ${l6} in house ${planet(c, l6).house}${names(6).filter((n) => n !== l6).length ? ` with ${names(6).filter((n) => n !== l6).join(", ")} in the 6th` : ""} governs disease resistance. Keep ${PLANET_INFO[l6].body.toLowerCase()} in check.`,
    ],
  });

  sections.push({
    key: "education",
    title: "Education & Intellect",
    icon: "📚",
    paragraphs: [
      `4th lord ${houseLord(c, 4)} (formal education) in house ${planet(c, houseLord(c, 4)).house}, 5th lord ${l5} (intellect) in house ${l5p.house}, and Mercury in ${SIGNS[planet(c, "Mercury").sign].en} (${dignity("Mercury", planet(c, "Mercury").sign, planet(c, "Mercury").deg)}) together describe your learning style. ${["Exalted", "Own Sign"].includes(dignity("Mercury", planet(c, "Mercury").sign, planet(c, "Mercury").deg)) ? "A strong Mercury gives excellent analytical and communication skills." : "Consistent study habits bring the best results."}`,
    ],
  });

  const ke = planet(c, "Ketu");
  sections.push({
    key: "spiritual",
    title: "Spirituality, Foreign & Fortune",
    icon: "🕉",
    paragraphs: [
      `9th lord ${houseLord(c, 9)} (fortune) is in house ${planet(c, houseLord(c, 9)).house}; 12th lord ${houseLord(c, 12)} is in house ${planet(c, houseLord(c, 12)).house}. ${[9, 12].includes(planet(c, houseLord(c, 12)).house) || [9, 12, 7].includes(planet(c, "Rahu").house) ? "Strong indications of foreign travel or settlement." : "Foreign travel is indicated mainly during Rahu or 12th-lord periods."}`,
      `Ketu in house ${ke.house} shows where you carry past-life wisdom and seek liberation — ${BHAVAS[ke.house - 1].title.toLowerCase()}. Your Atmakaraka ${find("AK")} reveals the soul's deepest lesson.`,
    ],
  });

  return sections;
}
