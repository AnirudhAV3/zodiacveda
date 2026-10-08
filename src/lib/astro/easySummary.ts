import { BHAVAS, PLANET_INFO, SIGNS, type PlanetId } from "./data";
import { subPeriods, type ChartData } from "./calc";
import { aspectedHouses, dignity, houseLord, planet, planetsInHouse } from "./analysis";
import { dashaPrediction } from "./predictions";
import { detectDoshas, detectYogas, remedyPlan } from "./yogas";

const fmt = (ms: number) =>
  new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function vargaHouse(sign: number, asc: number) {
  return ((sign - asc + 12) % 12) + 1;
}

function easyDignity(id: PlanetId, sign: number, deg: number, c: ChartData) {
  const d = dignity(id, sign, deg, c);
  if (["Exalted", "Own Sign", "Moolatrikona"].includes(d)) return "in a strong, helpful place";
  if (d === "Debilitated") return "in a tired, effort-needed place";
  if (d.includes("Enemy")) return "in a somewhat uncomfortable place";
  return "in an ordinary place";
}

function housePlain(h: number) {
  const map: Record<number, string> = {
    1: "your body, confidence and first impression",
    2: "money, speech and family support",
    3: "courage, siblings and short travel",
    4: "home, mother and inner peace",
    5: "children, studies, creativity and romance",
    6: "health, daily work, debts and rivals",
    7: "marriage, business partners and open agreements",
    8: "shared money, sudden change and deep research",
    9: "luck, father, teachers and long journeys",
    10: "career, status and how the world sees your work",
    11: "income, friends and wishes coming true",
    12: "sleep, expenses, foreign places and letting go",
  };
  return map[h] ?? BHAVAS[h - 1].title.toLowerCase();
}

export interface EasyBullet {
  title: string;
  text: string;
}

export interface EasyChartSummary {
  headline: string;
  inShort: string;
  charts: { key: string; title: string; rising: string; outlook: string; points: string[] }[];
  future: EasyBullet[];
  aspects: EasyBullet[];
  success: string[];
}

export interface EasyDashaSummary {
  currentTitle: string;
  currentDates: string;
  now: string;
  happening: string[];
  nextTitle: string;
  nextDates: string;
  next: string;
  doThis: string[];
  avoid: string[];
  remedies: string[];
}

export function buildEasyChartSummary(c: ChartData, now = Date.now(), transits?: Record<PlanetId, number>): EasyChartSummary {
  const lagna = SIGNS[c.asc.sign];
  const ll = lagna.lord;
  const llp = planet(c, ll);
  const moon = planet(c, "Moon");
  const d9Asc = SIGNS[c.asc.d9];
  const d10Asc = SIGNS[c.asc.d10];
  const l7 = houseLord(c, 7);
  const l7p = planet(c, l7);
  const l10 = houseLord(c, 10);
  const l10p = planet(c, l10);
  const ven = planet(c, "Venus");
  const jup = planet(c, "Jupiter");

  const d9House7Lord = SIGNS[(c.asc.d9 + 6) % 12].lord;
  const d9l7h = vargaHouse(planet(c, d9House7Lord).d9, c.asc.d9);
  const d10Lord = d10Asc.lord;
  const d10lh = vargaHouse(planet(c, d10Lord).d10, c.asc.d10);

  const allYogas = detectYogas(c, now);
  const allDoshas = detectDoshas(c, transits, now);
  const yogas = allYogas.filter((y) => y.present);
  const goodYogas = yogas.filter((y) => y.nature === "good").slice(0, 3);
  const doshas = allDoshas.filter((d) => d.present);
  const plan = remedyPlan(c, allYogas, allDoshas);

  const futureMd = c.dashas.filter((d) => d.start > now).slice(0, 2);
  const cur = c.dashas.find((d) => d.start <= now && d.end > now);

  const d1Outlook =
    [1, 4, 5, 9, 10, 11].includes(llp.house) || ["Exalted", "Own Sign", "Moolatrikona"].includes(dignity(ll, llp.sign, llp.deg, c))
      ? "Your main life-chart is generally supportive: effort tends to show."
      : [6, 8, 12].includes(llp.house)
        ? "Your main life-chart asks for patience. Results come, but usually after extra work and care."
        : "Your main life-chart is mixed — some areas flow, others need a plan.";

  const d9Outlook = [1, 4, 5, 7, 9, 10, 11].includes(d9l7h)
    ? "Your marriage/inner-strength chart looks capable of lasting partnership if you communicate."
    : [6, 8, 12].includes(d9l7h)
      ? "Your marriage chart shows lessons: choose slowly, and do not rush legal or emotional bonds."
      : "Your marriage chart is workable. Compatibility and timing matter more than luck.";

  const d10Outlook = [1, 4, 5, 9, 10, 11].includes(d10lh) || [1, 4, 5, 9, 10, 11].includes(l10p.house)
    ? "Your career chart supports visible work, promotions and a name in your field."
    : [6, 8, 12].includes(d10lh) && [6, 8, 12].includes(l10p.house)
      ? "Career may involve service, research, foreign places or several changes before you settle."
      : "Career grows in steps. Skill and reputation matter more than sudden luck.";

  const aspects: EasyBullet[] = [];
  const keyPlanets: PlanetId[] = [ll, l7, l10, "Jupiter", "Saturn"];
  const seen = new Set<string>();
  for (const id of keyPlanets) {
    const p = planet(c, id);
    for (const h of aspectedHouses(p)) {
      if (![1, 4, 5, 7, 9, 10, 11].includes(h) && !["Jupiter", "Saturn"].includes(id)) continue;
      const key = `${id}-${h}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const occupiers = planetsInHouse(c, h).map((x) => x.id);
      const helpful = id === "Jupiter" || (id === ll && [1, 5, 9, 10].includes(h));
      aspects.push({
        title: `${id} looks at house ${h}`,
        text: `${id} (${PLANET_INFO[id].karaka.split(",")[0].toLowerCase()}) aspects ${housePlain(h)}. ${
          occupiers.length ? `${occupiers.join(" and ")} sit there, so this link is personal.` : "The house is empty, so the aspect still colours that topic."
        } ${helpful ? "This is generally a protective or boosting link." : id === "Saturn" ? "Saturn’s look slows things down but makes them last if you stay disciplined." : "Take this as a real influence, not a curse."}`,
      });
      if (aspects.length >= 6) break;
    }
    if (aspects.length >= 6) break;
  }

  const success: string[] = [];
  for (const e of plan.strengthen.slice(0, 3)) {
    success.push(`On ${e.day}s, remember ${e.id}: a short recitation of “${e.mantra}”, or a simple offering of ${e.charity}. This supports ${e.reasons.slice(0, 2).join(" and ")}.`);
  }
  for (const e of plan.pacify.slice(0, 2)) {
    success.push(`Keep ${e.id} calm rather than forcing it: ${e.mantra ? `chant on ${e.day}s, ` : ""}charity of ${e.charity}, and avoid showing off in ${PLANET_INFO[e.id].karaka.split(",")[0].toLowerCase()}.`);
  }
  if (jup.house === 1 || aspectedHouses(jup).includes(1) || ["Exalted", "Own Sign"].includes(dignity("Jupiter", jup.sign, jup.deg, c))) {
    success.push("Respect teachers and keep a weekly study or prayer habit — Jupiter in your chart rewards sincerity.");
  }
  success.push("Sleep on time, tell the truth in money matters, and do not sign important papers in anger. These three habits help every chart.");
  if (doshas.length) success.push(`Your report also flags ${doshas.map((d) => d.name).slice(0, 3).join(", ")}. Open the Doshas tab for the exact checks and cancellations — do not fear the name alone.`);

  const future: EasyBullet[] = [];
  if (cur) {
    const ad = subPeriods(cur).find((d) => d.start <= now && d.end > now);
    future.push({
      title: `Right now · ${cur.lord} period`,
      text: `You are in a ${cur.lord} chapter until ${fmt(cur.end)}${ad ? `, and a ${ad.lord} sub-chapter until ${fmt(ad.end)}` : ""}. In plain words this chapter highlights ${housePlain(planet(c, cur.lord).house)}.`,
    });
  }
  for (const md of futureMd) {
    const strong = ["Exalted", "Own Sign", "Moolatrikona"].includes(dignity(md.lord, planet(c, md.lord).sign, planet(c, md.lord).deg, c)) || [1, 4, 5, 9, 10, 11].includes(planet(c, md.lord).house);
    future.push({
      title: `Coming · ${md.lord} period from ${fmt(md.start)}`,
      text: strong
        ? `This next long chapter tends to open doors in ${housePlain(planet(c, md.lord).house)}. Prepare skills now so you can use the wave.`
        : `This next long chapter asks for patience around ${housePlain(planet(c, md.lord).house)}. Plan, don’t panic; remedies below help.`,
    });
  }

  return {
    headline: `${c.input.name.split(" ")[0]}, here is your chart in everyday language`,
    inShort: `You present as ${lagna.en} rising — ${lagna.archetype.split(".")[0]}. Your Moon in ${SIGNS[moon.sign].en} is the mood you come home to. Venus in house ${ven.house} colours love; the 10th-lord ${l10} in house ${l10p.house} colours work. ${goodYogas.length ? `Helpful combinations on record include ${goodYogas.map((y) => y.name).join(", ")}.` : "No single yoga defines you; the three charts together do."}`,
    charts: [
      {
        key: "D1",
        title: "Life chart (D1)",
        rising: `${lagna.en} / ${lagna.sa}`,
        outlook: d1Outlook,
        points: [
          `This chart is the whole life: body, family, money, marriage and work as they appear in the world.`,
          `Your chart ruler is ${ll}, ${easyDignity(ll, llp.sign, llp.deg, c)}, sitting in the area of ${housePlain(llp.house)}.`,
          planetsInHouse(c, 1).length
            ? `Planets in the 1st house (${planetsInHouse(c, 1).map((p) => p.id).join(", ")}) show on your face and style.`
            : `The 1st house is empty, so ${ll} (the chart ruler) speaks for your personality.`,
        ],
      },
      {
        key: "D9",
        title: "Marriage & inner chart (D9)",
        rising: `${d9Asc.en} / ${d9Asc.sa}`,
        outlook: d9Outlook,
        points: [
          `Think of D9 as the quality of the second half of life and of marriage — not a second birthday.`,
          `Partner topics: 7th lord ${l7} in the main chart sits in the area of ${housePlain(l7p.house)}. Venus (love) is in ${SIGNS[ven.sign].en}, house ${ven.house}.`,
          `In D9, ${d9Asc.en} rises. The marriage-lord there is ${d9House7Lord} in D9-house ${d9l7h}.`,
        ],
      },
      {
        key: "D10",
        title: "Career chart (D10)",
        rising: `${d10Asc.en} / ${d10Asc.sa}`,
        outlook: d10Outlook,
        points: [
          `D10 is the office of the chart: job, bosses, public name and how you handle responsibility.`,
          `In the main chart the career-lord is ${l10}, in the area of ${housePlain(l10p.house)}.`,
          `In D10, ${d10Asc.en} rises and its lord ${d10Lord} occupies D10-house ${d10lh}.`,
        ],
      },
    ],
    future,
    aspects,
    success: success.slice(0, 6),
  };
}

export function buildEasyDashaSummary(c: ChartData, now = Date.now()): EasyDashaSummary | null {
  const md = c.dashas.find((d) => d.start <= now && d.end > now);
  if (!md) return null;
  const ads = subPeriods(md);
  const ad = ads.find((d) => d.start <= now && d.end > now) ?? ads[0];
  const nowPred = dashaPrediction(c, ad ? [md.lord, ad.lord] : [md.lord], ad ?? md, now);
  const nextAd = ads.find((d) => d.start >= (ad?.end ?? now));
  const nextMd = c.dashas.find((d) => d.start >= md.end);
  const nextPeriod = nextAd ?? nextMd;
  const nextChain: PlanetId[] = nextAd ? [md.lord, nextAd.lord] : nextMd ? [nextMd.lord] : [md.lord];
  const nextPred = nextPeriod ? dashaPrediction(c, nextChain, nextPeriod, now) : nowPred;

  return {
    currentTitle: ad ? `${md.lord} main period · ${ad.lord} sub-period` : `${md.lord} main period`,
    currentDates: `${fmt((ad ?? md).start)} → ${fmt((ad ?? md).end)}`,
    now: nowPred.summary,
    happening: nowPred.events.slice(0, 4),
    nextTitle: nextAd ? `Next sub-period · ${nextAd.lord}` : nextMd ? `Next main period · ${nextMd.lord}` : "Later in this same period",
    nextDates: nextPeriod ? `${fmt(nextPeriod.start)} → ${fmt(nextPeriod.end)}` : fmt(md.end),
    next: nextPred.summary,
    doThis: nowPred.todo.slice(0, 5),
    avoid: nowPred.avoid.slice(0, 5),
    remedies: nowPred.remedies.slice(0, 5).map((r) => r.text),
  };
}
