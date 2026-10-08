import type { ChartData } from "@/lib/astro/calc";
import { currentTransits, subPeriods, YEAR_MS } from "@/lib/astro/calc";
import { NAKSHATRAS, PLANET_INFO, SIGNS, type PlanetId } from "@/lib/astro/data";
import { dignity, functionalNature, houseLord } from "@/lib/astro/analysis";
import { computeShadbala } from "@/lib/astro/shadbala";
import { AV_PLANETS, computeAshtakavarga } from "@/lib/astro/ashtakavarga";
import { allPlanetReports } from "@/lib/astro/planetReport";
import { dashaPrediction, overallPredictions } from "@/lib/astro/predictions";
import type { DoshaResult, YogaResult } from "@/lib/astro/yogas";
import { buildGemReport } from "@/lib/gemstone/report";
import { buildSadeSatiReport } from "@/lib/dedicated-doshas/report";
import * as X from "@/lib/astro/extended";

type Doc = import("jspdf").jsPDF;
type RGB = [number, number, number];

const PDF_COLORS = {
  ink: [30, 41, 59] as RGB,
  muted: [100, 116, 139] as RGB,
  indigo: [39, 31, 92] as RGB,
  indigo2: [67, 56, 202] as RGB,
  teal: [13, 116, 144] as RGB,
  tealDark: [15, 78, 91] as RGB,
  saffron: [245, 158, 11] as RGB,
  gold: [180, 120, 24] as RGB,
  cream: [255, 251, 235] as RGB,
  blueWash: [239, 246, 255] as RGB,
  roseWash: [255, 241, 242] as RGB,
  rowAlt: [248, 250, 252] as RGB,
  line: [203, 213, 225] as RGB,
  white: [255, 255, 255] as RGB,
};

const clean = (s: string) =>
  String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[→]/g, "->")
    .replace(/[–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x00-\xFF]/g, "");

const DIG_ABBR: Record<string, string> = {
  Exalted: "Exalted",
  Debilitated: "Debilit",
  Moolatrikona: "Moltrikn",
  "Own Sign": "OwnSign",
  "Great Friend's Sign": "GFrSign",
  "Friend's Sign": "FrSign",
  "Neutral Sign": "NuSign",
  "Enemy's Sign": "EnSign",
  "Great Enemy's Sign": "GEnSign",
};

/* ---------------- chart drawing (black & white) ---------------- */
const N_CENTER: [number, number][] = [[200, 100], [100, 45], [45, 100], [100, 200], [45, 300], [100, 355], [200, 300], [300, 355], [355, 300], [300, 200], [355, 100], [300, 45]];
const N_NUM: [number, number][] = [[200, 176], [100, 86], [86, 100], [176, 200], [86, 300], [100, 314], [200, 224], [300, 314], [314, 300], [224, 200], [314, 100], [300, 86]];
const S_CELL: [number, number][] = [[1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [3, 3], [2, 3], [1, 3], [0, 3], [0, 2], [0, 1], [0, 0]];

function chartTitle(doc: Doc, x: number, y: number, S: number, title: string) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...PDF_COLORS.indigo);
  doc.text(clean(title), x + S / 2, y - 2, { align: "center" });
  doc.setFont("helvetica", "normal");
}

function items(doc: Doc, list: string[], cx: number, cy: number, fs: number, colGap: number) {
  doc.setFontSize(fs);
  const cols = list.length > 3 ? 2 : 1;
  const rows = Math.ceil(list.length / cols);
  const lh = fs * 0.42;
  const y0 = cy - ((rows - 1) * lh) / 2;
  list.forEach((t, i) => {
    const c = cols === 2 ? i % 2 : 0;
    const r = cols === 2 ? Math.floor(i / 2) : i;
    const xx = cols === 2 ? cx + (c === 0 ? -colGap : colGap) : cx;
    doc.text(clean(t), xx, y0 + r * lh, { align: "center", baseline: "middle" });
  });
}

/** North Indian diamond chart: houses[0] = house 1 */
function drawNorth(doc: Doc, x: number, y: number, S: number, title: string, houses: { label: string; items: string[] }[]) {
  chartTitle(doc, x, y, S, title);
  const s = S / 400;
  const P = (px: number, py: number): [number, number] => [x + px * s, y + py * s];
  doc.setDrawColor(...PDF_COLORS.gold);
  doc.setLineWidth(0.55);
  doc.setFillColor(...PDF_COLORS.cream);
  doc.rect(x, y, S, S, "FD");
  doc.setLineWidth(0.25);
  const L = (a: [number, number], b: [number, number]) => doc.line(...P(...a), ...P(...b));
  L([0, 0], [400, 400]);
  L([400, 0], [0, 400]);
  L([200, 0], [400, 200]);
  L([400, 200], [200, 400]);
  L([200, 400], [0, 200]);
  L([0, 200], [200, 0]);
  const fs = S < 65 ? 5.6 : 6.8;
  doc.setTextColor(0);
  houses.forEach((h, i) => {
    doc.setFontSize(fs - 0.6);
    const [nx, ny] = P(...N_NUM[i]);
    doc.text(clean(h.label), nx, ny, { align: "center", baseline: "middle" });
    const [cx, cy] = P(...N_CENTER[i]);
    items(doc, h.items, cx, cy, fs, S * 0.055);
  });
}

/** South Indian square chart: bySign[sign] */
function drawSouth(doc: Doc, x: number, y: number, S: number, title: string, ascSign: number, bySign: string[][]) {
  chartTitle(doc, x, y, S, title);
  const cs = S / 4;
  doc.setDrawColor(...PDF_COLORS.gold);
  doc.setLineWidth(0.55);
  doc.setFillColor(...PDF_COLORS.cream);
  doc.rect(x, y, S, S, "FD");
  doc.setLineWidth(0.25);
  for (let i = 1; i < 4; i++) {
    doc.line(x + i * cs, y, x + i * cs, y + (i === 2 ? cs : S));
    doc.line(x, y + i * cs, x + (i === 2 ? cs : S), y + i * cs);
  }
  doc.line(x + 2 * cs, y + 3 * cs, x + 2 * cs, y + S);
  doc.line(x + 3 * cs, y + 2 * cs, x + S, y + 2 * cs);
  doc.setFillColor(255, 255, 255);
  doc.rect(x + cs + 0.2, y + cs + 0.2, 2 * cs - 0.4, 2 * cs - 0.4, "F");
  doc.rect(x + cs, y + cs, 2 * cs, 2 * cs);
  const fs = S < 65 ? 5.6 : 6.8;
  S_CELL.forEach(([cx, cy], sign) => {
    const ox = x + cx * cs;
    const oy = y + cy * cs;
    doc.setFontSize(fs - 1.2);
    doc.text(X.SIGN_ABBR[sign], ox + 1, oy + 2.4);
    if (sign === ascSign) {
      doc.line(ox, oy + cs * 0.32, ox + cs * 0.32, oy);
      doc.setFontSize(fs - 1);
      doc.text("Asc", ox + cs - 1, oy + 2.4, { align: "right" });
    }
    items(doc, bySign[sign], ox + cs / 2, oy + cs / 2 + 1, fs, cs * 0.22);
  });
}

function signChart(doc: Doc, x: number, y: number, S: number, title: string, style: "north" | "south", ascSign: number, bySign: string[][]) {
  if (style === "south") return drawSouth(doc, x, y, S, title, ascSign, bySign);
  drawNorth(
    doc,
    x,
    y,
    S,
    title,
    Array.from({ length: 12 }, (_, i) => {
      const sg = (ascSign + i) % 12;
      return { label: String(sg + 1), items: bySign[sg] };
    }),
  );
}

function swastika(doc: Doc, x: number, y: number, s: number) {
  doc.setLineWidth(0.45);
  doc.line(x, y - s, x, y + s);
  doc.line(x - s, y, x + s, y);
  doc.line(x, y - s, x + s, y - s);
  doc.line(x + s, y, x + s, y + s);
  doc.line(x, y + s, x - s, y + s);
  doc.line(x - s, y, x - s, y - s);
}

/* ---------------- main ---------------- */
export function reportFileName(name: string) {
  const safe = clean(name).replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "Kundli";
  return `${safe}_Kundli_Report.pdf`;
}

/** Builds the traditional Kundli PDF and returns its bytes (works on the server and in the browser). */
export async function buildKundliPdf(c: ChartData, yogas: YogaResult[], doshas: DoshaResult[]): Promise<{ bytes: ArrayBuffer; filename: string }> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 10;
  const TOP = 21;
  const BOTTOM = 16;
  let y = TOP;
  const now = Date.now();
  const off = c.tzOffsetMin;
  const style = c.input.style;
  const lastY = () => (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  const base = {
    theme: "grid" as const,
    styles: { font: "helvetica", fontSize: 7.2, cellPadding: 1.05, textColor: PDF_COLORS.ink, lineColor: PDF_COLORS.line, lineWidth: 0.12, overflow: "linebreak" as const, valign: "middle" as const },
    headStyles: { fillColor: PDF_COLORS.tealDark, textColor: PDF_COLORS.white, fontStyle: "bold" as const, lineColor: PDF_COLORS.tealDark, lineWidth: 0.15, halign: "center" as const },
    alternateRowStyles: { fillColor: PDF_COLORS.rowAlt },
  };
  type TOpts = Parameters<typeof autoTable>[1];
  const table = (o: TOpts, gap = 4) => {
    autoTable(doc, {
      ...base,
      startY: y,
      ...o,
      styles: { ...base.styles, ...(o.styles ?? {}) },
      headStyles: { ...base.headStyles, ...(o.headStyles ?? {}) },
      alternateRowStyles: { ...base.alternateRowStyles, ...(o.alternateRowStyles ?? {}) },
      margin: { left: M, right: M, top: TOP, bottom: BOTTOM, ...((o.margin as object) ?? {}) },
      body: (o.body ?? []).map((r) => (Array.isArray(r) ? r.map((cell) => (typeof cell === "string" ? clean(cell) : cell)) : r)),
    });
    y = lastY() + gap;
  };
  const newPage = () => {
    doc.addPage();
    y = TOP;
  };
  const ensure = (h: number) => {
    if (y + h > H - BOTTOM) newPage();
  };
  const title = (t: string) => {
    ensure(14);
    doc.setFillColor(...PDF_COLORS.indigo);
    doc.roundedRect(M, y - 4, W - 2 * M, 8.5, 1.8, 1.8, "F");
    doc.setFillColor(...PDF_COLORS.saffron);
    doc.rect(M, y - 4, 2.2, 8.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...PDF_COLORS.white);
    doc.text(clean(t), M + 5, y + 1.2);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...PDF_COLORS.ink);
    y += 8.5;
  };
  const sub = (t: string) => {
    ensure(9);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(clean(t), M, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...PDF_COLORS.ink);
    y += 4.2;
  };
  const para = (t: string, fs = 8.3, italic = false) => {
    doc.setFont("helvetica", italic ? "italic" : "normal");
    doc.setFontSize(fs);
    doc.setTextColor(...PDF_COLORS.ink);
    const lines = doc.splitTextToSize(clean(t), W - 2 * M);
    for (const ln of lines) {
      ensure(5);
      doc.text(ln, M, y);
      y += fs * 0.42;
    }
    doc.setFont("helvetica", "normal");
    y += 1.6;
  };
  const kvBold = (n: number) => Object.fromEntries(Array.from({ length: n }, (_, i) => [i, i % 2 === 0 ? { fontStyle: "bold" as const, fillColor: PDF_COLORS.blueWash } : {}]));

  const td = X.timeDetails(c);
  const sp = X.sunrisePanchang(c);
  const av = X.avakahadaFull(c);
  const gk = X.ghatak(c);
  const P = (id: PlanetId) => c.planets.find((p) => p.id === id)!;
  const dobStr = c.input.date.split("-").reverse().join("/");

  /* ===== PAGE 1: Basic Details & Avakahada ===== */
  title("Basic Details");
  table({
    body: [
      ["Name", c.input.name, "Sex", c.input.gender === "female" ? "Female" : "Male", "Date of Birth", dobStr],
      ["Day", c.panchang.vaar, "Time of Birth", `${td.timeStr} Hrs`, "Ishta", `${td.ishta} Ghati`],
      ["Place of Birth", { content: c.input.place, colSpan: 5 }],
      ["Latitude", td.latStr, "Longitude", td.lonStr, "Zone", td.zoneStr],
      ["Loc Time Corr", `${td.locCorr} Hr`, "War Time Corr", `${td.warCorr} Hr`, "LMT", `${td.lmt} Hr`],
      ["Eq. of Time", `${td.eot} Hr`, "Sidereal Time", `${td.lst} Hr`, "Day Duration", td.dayDur],
      ["Sunrise", td.sunrise, "Sunset", td.sunset, "Season", td.season],
      ["Sun Pos (Ayan)", td.ayan, "Sun Pos (Gola)", td.gola, "Sun Degree", td.sunDeg],
      ["Ascendant Degree", { content: td.ascDeg, colSpan: 5 }],
    ],
    columnStyles: kvBold(6),
  });

  const twoCol = (t1: string, r1: string[][], t2: string, r2: string[][]) => {
    ensure(10 + Math.max(r1.length, r2.length) * 4.2);
    const y0 = y;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(t1, M + (W / 2 - M) / 2, y0, { align: "center" });
    doc.text(t2, W / 2 + (W / 2 - M) / 2, y0, { align: "center" });
    doc.setFont("helvetica", "normal");
    y = y0 + 2.5;
    table({ body: r1, margin: { left: M, right: W / 2 + 1.5 }, columnStyles: { 0: { fontStyle: "bold", fillColor: PDF_COLORS.blueWash } } }, 0);
    const a = lastY();
    y = y0 + 2.5;
    table({ body: r2, margin: { left: W / 2 + 1.5, right: M }, columnStyles: { 0: { fontStyle: "bold", fillColor: PDF_COLORS.blueWash } } }, 0);
    y = Math.max(a, lastY()) + 4;
  };
  twoCol(
    "Avakahada Chakra",
    [
      ["Ascendant - Lord", av.ascLord],
      ["Rasi - Lord", av.rasiLord],
      ["Naksh. - Charan", av.nakCharan],
      ["Nakshatra Lord", av.nakLord],
      ["Yoga", av.yoga],
      ["Karan", av.karan],
      ["Gana", av.gana],
      ["Yoni", av.yoni],
      ["Nadi", av.nadi],
      ["Varan", av.varan],
      ["Vashya", av.vashya],
      ["Varga", av.varga],
      ["Yunja", av.yunja],
      ["Hansak (Tatva)", av.hansak],
      ["Name Alphabet", av.nameAlpha],
      ["Paya (Rasi - Nak)", av.paya],
      ["SunSign (Western)", av.sunWest],
    ],
    "Panchang",
    [
      ["Samvat / Saka", `${sp.samvat} / ${sp.saka}`],
      ["Month (Amanta)", sp.month],
      ["Paksha", sp.paksha],
      ["Tithi at Sunrise", sp.tithi],
      ["Tithi Ending Time", sp.tithiEnd],
      ["Nak. at Sunrise", sp.nak],
      ["Nak. Ending Time", sp.nakEnd],
      ["Yoga at Sunrise", sp.yoga],
      ["Yoga Ending Time", sp.yogaEnd],
      ["Karan at Sunrise", sp.karana],
      ["Karan Ending Time", sp.karanaEnd],
      ["Tithi at Birth", `${c.panchang.paksha} ${c.panchang.tithi}`],
      ["Nakshatra at Birth", `${NAKSHATRAS[P("Moon").nak].name} (${P("Moon").pada})`],
      ["Vedic Weekday", c.panchang.vaar],
      ["Ayanamsa (Lahiri)", X.dms(c.ayanamsa)],
      ["Sunrise / Sunset", `${td.sunrise} / ${td.sunset}`],
      ["Ishta Kaal", `${td.ishta} Ghati`],
    ],
  );
  title("Ghatak Chakra (Inauspicious factors)");
  table({
    body: [
      ["Month", gk.month, "Tithi", gk.tithi, "Day", gk.day, "Nakshatra", gk.nakshatra],
      ["Yoga", gk.yoga, "Karan", gk.karan, "Prahar", gk.prahar, "Lagna", gk.lagna],
    ],
    columnStyles: kvBold(8),
  });

  /* ===== PAGE 2: Planetary degrees & charts ===== */
  newPage();
  title("Planetary Degrees and Positions");
  const kpRow = (lon: number) => X.kpLords(lon);
  const ascK = kpRow(c.asc.lon);
  const rows: string[][] = [["Asc", "", X.SIGN_ABBR[c.asc.sign], X.dms(c.asc.deg), X.dms(X.ascSpeed(c)), X.NAK_SHORT[c.asc.nak], String(c.asc.pada), X.PL_ABBR[ascK.rl], X.PL_ABBR[ascK.nl], X.PL_ABBR[ascK.sub], ""]];
  for (const p of c.planets) {
    const k = kpRow(p.lon);
    const rc = `${p.retro && !["Rahu", "Ketu"].includes(p.id) ? "R" : ["Rahu", "Ketu"].includes(p.id) ? "R" : ""}${p.combust ? "C" : ""}`;
    rows.push([X.PL_ABBR[p.id], rc, X.SIGN_ABBR[p.sign], X.dms(p.deg), X.dms(Math.abs(p.speed)), X.NAK_SHORT[p.nak], String(p.pada), X.PL_ABBR[k.rl], X.PL_ABBR[k.nl], X.PL_ABBR[k.sub], DIG_ABBR[dignity(p.id, p.sign, p.deg, c)] ?? ""]);
  }
  const outer = X.outerPlanets(c);
  for (const o of outer) {
    const k = kpRow(o.lon);
    const nak = Math.floor(o.lon / (360 / 27));
    rows.push([o.name, o.retro ? "R" : "", X.SIGN_ABBR[Math.floor(o.lon / 30)], X.dms(o.lon % 30), X.dms(Math.abs(o.speed)), X.NAK_SHORT[nak], String(Math.floor((o.lon % (360 / 27)) / (360 / 108)) + 1), X.PL_ABBR[k.rl], X.PL_ABBR[k.nl], X.PL_ABBR[k.sub], ""]);
  }
  const mcK = kpRow(c.mc);
  rows.push(["MC", "", X.SIGN_ABBR[Math.floor(c.mc / 30)], X.dms(c.mc % 30), "", X.NAK_SHORT[Math.floor(c.mc / (360 / 27))], String(Math.floor((c.mc % (360 / 27)) / (360 / 108)) + 1), X.PL_ABBR[mcK.rl], X.PL_ABBR[mcK.nl], X.PL_ABBR[mcK.sub], ""]);
  table({ head: [["Pl", "RC", "Rasi", "Degree", "Speed", "Nak", "Pad", "RL", "NL", "Sub", "Dignity"]], body: rows, styles: { halign: "center" } }, 1.5);
  doc.setFontSize(7.5);
  doc.text(clean(`Rahu: Mean Node   |   Lahiri Ayanamsa: ${X.dms(c.ayanamsa)}   |   R = Retrograde, C = Combust`), M, y + 2);
  y += 9;
  const bySign = (sel: (p: ChartData["planets"][number]) => number, deg = false) => {
    const arr: string[][] = Array.from({ length: 12 }, () => []);
    for (const p of c.planets) arr[sel(p)].push(`${X.PL_ABBR[p.id]}${deg ? ` ${Math.floor(p.deg)}` : ""}${p.retro && !["Rahu", "Ketu"].includes(p.id) ? "R" : ""}`);
    return arr;
  };
  const S3 = (W - 2 * M - 12) / 3;
  ensure(S3 + 8);
  signChart(doc, M, y + 3, S3, "Lagna Chart", style, c.asc.sign, bySign((p) => p.sign, true));
  signChart(doc, M + S3 + 6, y + 3, S3, "Moon Chart", style, P("Moon").sign, bySign((p) => p.sign));
  signChart(doc, M + 2 * (S3 + 6), y + 3, S3, "Navamsa Chart", style, c.asc.d9, bySign((p) => p.d9));
  y += S3 + 10;
  ensure(S3 + 8);
  signChart(doc, M + (S3 + 6) / 2, y + 3, S3, "Dasamsa (D10) Chart", style, c.asc.d10, bySign((p) => p.d10));
  signChart(doc, M + (S3 + 6) * 1.5, y + 3, S3, "Hora (D2) Chart", style, X.vargaSign(c.asc.lon, 2), bySign((p) => X.vargaSign(p.lon, 2)));
  y += S3 + 8;

  /* ===== PAGE 3: Chalit / Bhava / Tara ===== */
  newPage();
  title("Chalit and Nirayana Bhava Chalit");
  const sri = X.sripati(c);
  const plac = X.placidusTropical(c).map((t) => (t - c.ayanamsa + 720) % 360);
  table({
    head: [["Bhava", "Bhava Start (Sandhi)", "Bhava Middle", "Nirayana Cusp Rasi", "Degree"]],
    body: sri.mid.map((m, i) => [String(i + 1), X.signDeg(sri.start[i]), X.signDeg(m), SIGNS[Math.floor(plac[i] / 30)].en, X.dms(plac[i] % 30)]),
    styles: { halign: "center" },
  });
  doc.setFontSize(7.2);
  doc.text("Bhava Start / Middle: Sripati system. Nirayana Cusp: Placidus with Lahiri ayanamsa.", M, y - 1.5);
  y += 3;
  title("Tara Chakra");
  table({ head: [["Tara", "Nakshatra 1", "Nakshatra 2", "Nakshatra 3", "Result"]], body: X.taraChakra(c).map((t, i) => [t.tara, ...t.naks, [2, 4, 6].includes(i) ? "Inauspicious" : i === 0 ? "Mixed" : "Auspicious"]), styles: { halign: "center" } });
  const S2 = (W - 2 * M - 14) / 2;
  ensure(S2 + 8);
  const chalitHouses = Array.from({ length: 12 }, () => [] as string[]);
  for (const p of c.planets) chalitHouses[X.chalitHouseOf(p.lon, sri.start) - 1].push(X.PL_ABBR[p.id]);
  drawNorth(doc, M, y + 3, S2, "Chalit Chart", sri.mid.map((m, i) => ({ label: String(Math.floor(m / 30) + 1), items: chalitHouses[i] })));
  drawNorth(doc, M + S2 + 14, y + 3, S2, "Cusp Chart (Placidus)", plac.map((p) => ({ label: String(Math.floor(p / 30) + 1), items: [X.dms(p % 30).slice(0, 5)] })));
  y += S2 + 8;

  /* ===== PAGE 4: KP System ===== */
  newPage();
  title("KP System");
  const kpAy = X.kpAyanamsa(c);
  const isDay = c.sunTimes?.isDay ?? true;
  const fortuna = ((c.asc.lon + (isDay ? P("Moon").lon - P("Sun").lon : P("Sun").lon - P("Moon").lon)) % 360 + 360) % 360;
  table({ body: [["Balance of Dasa", `${c.dashaBalance.lord} ${X.ymd(c.dashaBalance.years)}`, "KP Ayanamsa", X.dms(kpAy), "Fortuna", `${SIGNS[Math.floor(fortuna / 30)].en} ${X.dms(fortuna % 30)}`]], columnStyles: kvBold(6) });
  const kpCusps = X.placidusTropical(c).map((t) => (t - kpAy + 720) % 360);
  const kpPl = [
    ...c.planets.map((p) => ({ n: X.PL_ABBR[p.id], r: p.retro && !["Rahu", "Ketu"].includes(p.id) ? "R" : ["Rahu", "Ketu"].includes(p.id) ? "R" : "", lon: (p.lon + c.ayanamsa - kpAy + 360) % 360 })),
    ...outer.map((o) => ({ n: o.name, r: o.retro ? "R" : "", lon: (o.lon + c.ayanamsa - kpAy + 360) % 360 })),
  ];
  const kpBody = Array.from({ length: 12 }, (_, i) => {
    const p = kpPl[i];
    const pk = X.kpLords(p.lon);
    const hk = X.kpLords(kpCusps[i]);
    return [p.n, p.r, X.SIGN_ABBR[Math.floor(p.lon / 30)], X.dms(p.lon % 30), X.PL_ABBR[pk.rl], X.PL_ABBR[pk.nl], X.PL_ABBR[pk.sub], X.PL_ABBR[pk.ss], String(i + 1), X.SIGN_ABBR[Math.floor(kpCusps[i] / 30)], X.dms(kpCusps[i] % 30), X.PL_ABBR[hk.rl], X.PL_ABBR[hk.nl], X.PL_ABBR[hk.sub], X.PL_ABBR[hk.ss]];
  });
  table({
    head: [
      [{ content: "Planets", colSpan: 8 }, { content: "Nirayana Bhava (Placidus Cusps)", colSpan: 7 }],
      ["Planet", "R", "Sign", "Degree", "RL", "NL", "Sb", "SS", "House", "Sign", "Degree", "RL", "NL", "Sb", "SS"],
    ],
    body: kpBody,
    styles: { halign: "center", fontSize: 6.8 },
  });
  ensure(S2 + 8);
  const kpHouseOf = (lon: number) => {
    for (let i = 0; i < 12; i++) {
      const a = kpCusps[i];
      const b = kpCusps[(i + 1) % 12];
      if ((lon - a + 360) % 360 < (b - a + 360) % 360) return i;
    }
    return 0;
  };
  const kpAscSign = Math.floor(kpCusps[0] / 30);
  const kpBySign: string[][] = Array.from({ length: 12 }, () => []);
  const kpByHouse: string[][] = Array.from({ length: 12 }, () => []);
  for (const p of kpPl.slice(0, 9)) {
    kpBySign[Math.floor(p.lon / 30)].push(p.n);
    kpByHouse[kpHouseOf(p.lon)].push(p.n);
  }
  signChart(doc, M, y + 3, S2, "KP Lagna Chart", style, kpAscSign, kpBySign);
  drawNorth(doc, M + S2 + 14, y + 3, S2, "KP Cusp Chart", kpCusps.map((cp, i) => ({ label: String(Math.floor(cp / 30) + 1), items: kpByHouse[i] })));
  y += S2 + 8;

  /* ===== PAGE 5: Shodashvarga & Vimsopaka ===== */
  newPage();
  title("Shodashvarga Table");
  const colsV = ["Asc", ...c.planets.map((p) => X.PL_ABBR[p.id])];
  table({
    head: [["Varga", ...colsV]],
    body: X.VARGAS.map(([n, name]) => [`${name} (D${n})`, X.SIGN_ABBR[X.vargaSign(c.asc.lon, n)], ...c.planets.map((p) => X.SIGN_ABBR[X.vargaSign(p.lon, n)])]),
    styles: { halign: "center" },
    columnStyles: { 0: { halign: "left", fontStyle: "bold" } },
  });
  const vim = X.vimsopaka(c);
  const sets = ["ShadVarga", "SaptVarga", "DasaVarga", "ShodashVarga"];
  title("Varga - Bhedas");
  table({ head: [["Planet", ...sets]], body: vim.map((v) => [v.id, ...sets.map((k) => `${v[k].count} - ${v[k].name}`)]), styles: { halign: "center" } });
  title("Vimsopaka Strength (out of 20)");
  table({ head: [["Planet", ...sets]], body: vim.map((v) => [v.id, ...sets.map((k) => v[k].score.toFixed(2))]), styles: { halign: "center" } });

  /* ===== PAGE 6: Shadbala & Bhavabala ===== */
  newPage();
  title("Shadbala");
  const sb = computeShadbala(c).rows;
  const f2 = (n: number) => n.toFixed(2);
  const sbRow = (label: string, fn: (r: (typeof sb)[number]) => string) => [label, ...sb.map(fn)];
  table({
    head: [["Bala", ...sb.map((r) => X.PL_ABBR[r.id])]],
    body: [
      sbRow("Ochcha Bala", (r) => f2(r.sthanaParts.uchcha)),
      sbRow("Saptavargaja Bala", (r) => f2(r.sthanaParts.saptavargaja)),
      sbRow("Ojayugmarasyamsa Bala", (r) => f2(r.sthanaParts.ojayugma)),
      sbRow("Kendra Bala", (r) => f2(r.sthanaParts.kendradi)),
      sbRow("Drekkana Bala", (r) => f2(r.sthanaParts.drekkana)),
      sbRow("Total Sthan Bala", (r) => f2(r.sthana)),
      sbRow("Total Dig Bala", (r) => f2(r.dig)),
      sbRow("Nathonnatha Bala", (r) => f2(r.kalaParts.nathonnata)),
      sbRow("Paksha Bala", (r) => f2(r.kalaParts.paksha)),
      sbRow("Thribhaga Bala", (r) => f2(r.kalaParts.tribhaga)),
      sbRow("Abda Bala", (r) => f2(r.kalaParts.abda)),
      sbRow("Masa Bala", (r) => f2(r.kalaParts.masa)),
      sbRow("Vara Bala", (r) => f2(r.kalaParts.vara)),
      sbRow("Hora Bala", (r) => f2(r.kalaParts.hora)),
      sbRow("Ayana Bala", (r) => f2(r.kalaParts.ayana)),
      sbRow("Yuddha Bala", (r) => f2(r.kalaParts.yuddha)),
      sbRow("Total Kala Bala", (r) => f2(r.kala)),
      sbRow("Total Chesta Bala", (r) => f2(r.cheshta)),
      sbRow("Total Naisargika Bala", (r) => f2(r.naisargika)),
      sbRow("Total Drik Bala", (r) => f2(r.drik)),
      sbRow("Total Shad Bala", (r) => f2(r.total)),
      sbRow("ShadBala in Rupas", (r) => f2(r.rupas)),
      sbRow("Minimum Requirement", (r) => f2(r.required)),
      sbRow("Ratio", (r) => f2(r.ratio)),
      sbRow("Relative Rank", (r) => String(r.rank)),
      sbRow("Ishta Phala", (r) => f2(r.ishta)),
      sbRow("Kashta Phala", (r) => f2(r.kashta)),
    ],
    styles: { halign: "center", fontSize: 7 },
    columnStyles: { 0: { halign: "left", fontStyle: "bold" } },
  });
  title("Bhavabala");
  const bb = X.bhavaBala(c);
  table({
    head: [["Bhava", ...bb.map((b) => String(b.h))]],
    body: [
      ["Bhavadhipati Bala", ...bb.map((b) => b.adhipati.toFixed(1))],
      ["Bhava Dig Bala", ...bb.map((b) => b.dig.toFixed(1))],
      ["Bhavadrishti Bala", ...bb.map((b) => b.drishti.toFixed(1))],
      ["Total Bhava Bala", ...bb.map((b) => b.total.toFixed(1))],
      ["Bhavabala in Rupas", ...bb.map((b) => b.rupas.toFixed(2))],
      ["Relative Rank", ...bb.map((b) => String(b.rank))],
    ],
    styles: { halign: "center", fontSize: 6.8 },
    columnStyles: { 0: { halign: "left", fontStyle: "bold", cellWidth: 30 } },
  });

  /* ===== ASHTAKAVARGA: raw, reductions and Sodhya Pinda ===== */
  newPage();
  title("Ashtakavarga - Bhinnashtakavarga & Sarvashtakavarga");
  const avarga = computeAshtakavarga(c);
  table({
    head: [["Planet / Sign", ...SIGNS.map((sg) => sg.sa), "Total"]],
    body: [
      ...avarga.bav.map((row, i) => [AV_PLANETS[i], ...row.map(String), String(row.reduce((a, b) => a + b, 0))]),
      ["Sarva (SAV)", ...avarga.sav.map(String), String(avarga.checksum.sarvaTotal)],
    ],
    styles: { halign: "center", fontSize: 6.4, cellPadding: 0.7 },
    columnStyles: { 0: { halign: "left", fontStyle: "bold", cellWidth: 27 } },
    didParseCell: (data) => {
      if (data.section === "body" && data.row.index === 7) {
        data.cell.styles.fillColor = PDF_COLORS.cream;
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = PDF_COLORS.indigo;
      }
    },
  });
  para(`Classical checksum: Sun 48, Moon 49, Mars 39, Mercury 54, Jupiter 56, Venus 52, Saturn 39; Sarvashtakavarga = ${avarga.checksum.sarvaTotal}. Check: ${avarga.checksum.valid ? "PASS" : "FAIL"}. Rahu and Ketu are excluded.`, 7.5, true);

  title("Ashtakavarga Reductions");
  table({
    head: [["Planet", "Trikona Reduction (Aries to Pisces)", "Ekadhipatya Reduction (Aries to Pisces)"]],
    body: avarga.trikona.map((row, i) => [AV_PLANETS[i], row.join("  "), avarga.ekadhipatya[i].join("  ")]),
    styles: { fontSize: 7.1 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 25 }, 1: { font: "courier" }, 2: { font: "courier" } },
  });

  title("Sodhya Pinda");
  table({
    head: [["Planet", "Rasi Pinda", "Graha Pinda", "Sodhya Pinda"]],
    body: AV_PLANETS.map((id, i) => [id, String(avarga.rasiPinda[i]), String(avarga.grahaPinda[i]), String(avarga.sodhyaPinda[i])]),
    styles: { halign: "center" },
    columnStyles: { 0: { halign: "left", fontStyle: "bold" } },
  });

  title("Sarvashtakavarga House Strength");
  table({
    head: [["Bhava", "Rasi", "SAV Bindus", "Reading"]],
    body: avarga.houseScores.map((h) => [String(h.house), SIGNS[h.sign].sa, String(h.score), h.label]),
    styles: { halign: "center" },
    columnStyles: { 3: { fontStyle: "bold" } },
    didParseCell: (data) => {
      if (data.section !== "body" || data.column.index !== 2) return;
      const value = Number(data.cell.raw);
      data.cell.styles.fillColor = value >= 30 ? [220, 252, 231] : value < 25 ? PDF_COLORS.roseWash : PDF_COLORS.cream;
      data.cell.styles.textColor = value >= 30 ? [22, 101, 52] : value < 25 ? [190, 24, 93] : PDF_COLORS.gold;
      data.cell.styles.fontStyle = "bold";
    },
  });
  para("Reading guide: 30 or more bindus is strong for transit support; 28-29 is above average; 25-27 is average; below 25 asks for greater care. Ashtakavarga is a transit-strength system, not a stand-alone prediction.", 7.7, true);

  /* ===== PAGE 7: Vimshottari Dasha ===== */
  newPage();
  title("Vimshottari Dasha");
  para(`Balance of Dasa at birth: ${c.dashaBalance.lord} ${X.ymd(c.dashaBalance.years)}`, 9);
  const birth = Date.parse(c.utc);
  const mds = c.dashas.filter((d) => d.end > birth && d.start < birth + 121 * YEAR_MS);
  table({
    head: [["Mahadasha", "Years", "Start Date", "End Date", "Age at Start", "Status"]],
    body: mds.map((d) => [PLANET_INFO[d.lord].sa + ` (${d.lord})`, String(PLANET_INFO[d.lord].years), X.dmy(Math.max(d.start, birth), off), X.dmy(d.end, off), `${Math.max(0, (Math.max(d.start, birth) - birth) / YEAR_MS).toFixed(1)} yrs`, d.end < now ? "Completed" : d.start <= now ? "Running" : "Upcoming"]),
    styles: { halign: "center" },
  });
  const curMd = c.dashas.find((d) => d.start <= now && d.end > now);
  const curAd = curMd && subPeriods(curMd).find((d) => d.start <= now && d.end > now);
  const curPd = curAd && subPeriods(curAd).find((d) => d.start <= now && d.end > now);
  if (curMd && curAd && curPd) para(`Current period: ${curMd.lord} Mahadasha - ${curAd.lord} Antardasha - ${curPd.lord} Pratyantar (till ${X.dmy(curPd.end, off)}).`, 8.5);

  /* ===== PAGE 8: Antardasha & Pratyantar grids ===== */
  const grid = (blocks: { head: string; rows: string[][] }[], heading: string) => {
    title(heading);
    const colW = (W - 2 * M - 6) / 3;
    for (let i = 0; i < blocks.length; i += 3) {
      ensure(48);
      const y0 = y;
      let maxY = y0;
      for (let k = 0; k < 3 && i + k < blocks.length; k++) {
        const b = blocks[i + k];
        y = y0;
        table(
          {
            head: [[{ content: b.head, colSpan: 3 }], ["Period", "Start", "End"]],
            body: b.rows,
            margin: { left: M + k * (colW + 3), right: W - M - (k + 1) * colW - k * 3 },
            styles: { halign: "center", fontSize: 6.6, cellPadding: 0.7 },
            pageBreak: "avoid",
          },
          0,
        );
        maxY = Math.max(maxY, lastY());
      }
      y = maxY + 4;
    }
  };
  newPage();
  grid(
    mds.map((md) => ({ head: `${md.lord} Mahadasha (${X.dmy(Math.max(md.start, birth), off)} - ${X.dmy(md.end, off)})`, rows: subPeriods(md).map((ad) => [`${X.PL_ABBR[md.lord]}-${X.PL_ABBR[ad.lord]}`, X.dmy(ad.start, off), X.dmy(ad.end, off)]) })),
    "Vimshottari Dasha - Antardasha (Sub Periods)",
  );
  const fiveY = now + 5 * YEAR_MS;
  const pdBlocks: { head: string; rows: string[][] }[] = [];
  for (const md of c.dashas)
    for (const ad of subPeriods(md))
      if (ad.end > now && ad.start < fiveY) pdBlocks.push({ head: `${X.PL_ABBR[md.lord]}-${X.PL_ABBR[ad.lord]} (${X.dmy(ad.start, off)} - ${X.dmy(ad.end, off)})`, rows: subPeriods(ad).map((pd) => [`${X.PL_ABBR[ad.lord]}-${X.PL_ABBR[pd.lord]}`, X.dmy(pd.start, off), X.dmy(pd.end, off)]) });
  grid(pdBlocks, "Vimshottari Dasha - Sub-Sub Periods (Pratyantar) for next 5 years");

  /* ===== PAGE 9: Favourable points & gemstones ===== */
  newPage();
  title("Favourable Points");
  const fp = X.favourablePoints(c);
  table({
    body: [
      ["Radical No.", String(fp.radical), "Lucky No.", String(fp.lucky)],
      ["Friendly Nos.", fp.friendly.join(", "), "Evil Nos.", fp.evil.join(", ")],
      ["Good Years (age)", { content: fp.goodYears.join(", "), colSpan: 3 }],
      ["Fav. Days", fp.favDays.join(", "), "Fav. Planets", fp.favPlanets.join(", ")],
      ["Friendly Signs", fp.friendlySigns.join(", "), "Friendly Asc", fp.friendlyAsc.join(", ")],
      ["God - Worship", fp.god, "Fav. Stone", fp.favStone],
      ["Lucky Stone", fp.luckyStone, "Fav. Metal", fp.metal],
      ["Fav. Color", fp.color, "Fav. Direction", fp.direction],
      ["Fav. Time", fp.time, "Donation Items", fp.donation],
      ["Cereals", fp.cereals, "Liquids", fp.liquids],
    ],
    columnStyles: kvBold(4),
  });
  title("Gemstone Recommendations");
  table({
    head: [["Type", "Stone", "Planet", "Ratti", "Metal", "Finger", "Day", "Time", "Nakshatra", "Mantra", "Contradictory Stone", "Donation Items"]],
    body: X.gemTable(c).map((g) => [g.label, g.stone, g.planet, g.ratti, g.metal, g.finger, g.day, g.time, g.naks, g.mantra, g.contra, g.donation]),
    styles: { fontSize: 6.2, cellPadding: 0.8 },
  });
  para("Wear gemstones only after testing for a trial period and consulting an experienced astrologer. Energise the stone with its mantra (108 times) on the prescribed day and time.", 7.6, true);
  const gemReport = buildGemReport(c, now);
  sub("Chart-specific Gemstone Verdicts");
  table({
    head: [["Planet", "Stone", "Verdict", "Classical Role / Reason"]],
    body: gemReport.all.map((g) => [g.planet, g.stone, g.verdict === "primary" ? "Recommended" : g.verdict === "supportive" ? "Optional" : g.verdict === "avoid" ? "Avoid" : "Not needed", g.role ?? g.reasons[0]]),
    styles: { fontSize: 7 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 20 }, 2: { fontStyle: "bold", cellWidth: 24 } },
    didParseCell: (data) => {
      if (data.section !== "body" || data.column.index !== 2) return;
      const value = String(data.cell.raw);
      data.cell.styles.fillColor = value === "Recommended" ? [220, 252, 231] : value === "Avoid" ? PDF_COLORS.roseWash : PDF_COLORS.cream;
      data.cell.styles.textColor = value === "Recommended" ? [22, 101, 52] : value === "Avoid" ? [190, 24, 93] : PDF_COLORS.gold;
    },
  });
  if (curAd) {
    const currentGem = gemReport.all.find((g) => g.planet === curAd.lord);
    if (currentGem) para(`Current ${curMd?.lord}-${curAd.lord} period: ${currentGem.stone} is marked "${currentGem.verdict}" for this ascendant. Do not wear a Dasha lord's stone automatically; follow the chart-specific verdict above.`, 7.7, true);
  }

  /* ===== PAGE 10+: Analysis & predictions ===== */
  newPage();
  title("Yoga Karakas & Planetary Strengths");
  const reps = allPlanetReports(c);
  table({
    head: [["Planet", "Functional Nature", "Dignity", "Shadbala %", "Overall Strength", "Verdict"]],
    body: reps.map((r) => [r.id, r.functional.label, r.dignity, r.shadbala ? `${(r.shadbala.ratio * 100).toFixed(0)}%` : "-", `${r.score}%`, r.verdict]),
    styles: { halign: "center" },
  });
  const yk = c.planets.filter((p) => functionalNature(c, p.id).label === "Yogakaraka").map((p) => p.id);
  para(`Yogakaraka: ${yk.length ? yk.join(", ") : "No single planet owns both a Kendra and a Trikona for this Lagna"}. Lagna lord: ${SIGNS[c.asc.sign].lord}. Favourable planets: ${fp.favPlanets.join(", ")}.`, 8.3);
  const presentYogas = yogas.filter((yy) => yy.present);
  if (presentYogas.length) para(`Yogas present (${presentYogas.length}): ${presentYogas.map((yy) => yy.name).join(", ")}.`, 8);
  sub("Strength Matrix across Dasa Periods (next 5 years)");
  const matrix: string[][] = [];
  for (const md of c.dashas)
    for (const ad of subPeriods(md))
      if (ad.end > now && ad.start < fiveY) {
        const r = dashaPrediction(c, [md.lord, ad.lord], ad, now).rating;
        matrix.push([md.lord, ad.lord, X.dmy(ad.start, off), X.dmy(ad.end, off), `${Math.round(r * 20)}%`, r >= 4 ? "Excellent" : r >= 3 ? "Good" : r >= 2 ? "Average" : "Weak"]);
      }
  table({ head: [["Mahadasha", "Antardasha", "From", "To", "Strength", "Result"]], body: matrix, styles: { halign: "center" } });

  title("Manglik Analysis");
  para("If Mars is positioned in the 1st, 4th, 7th, 8th, or 12th house from the Lagna, Moon, or Venus, it creates Manglik Dosha, leading to potential delays or friction in marital harmony unless mitigated by neutralising planetary aspects.", 8.3, true);
  const mg = X.manglikAnalysis(c);
  table({ body: [["Mars from Lagna", `${mg.fromL} house`, "Mars from Moon", `${mg.fromM} house`, "Mars from Venus", `${mg.fromV} house`], ["Result", { content: mg.result, colSpan: 5 }]], columnStyles: kvBold(6) });
  para(mg.text);

  title("Kaal Sarp Analysis");
  para("When all primary planets are hemmed sequentially between Rahu and Ketu in a horoscope, it forms Kaal Sarp Yoga, causing obstacles and sudden transformations in various life pursuits.", 8.3, true);
  const ks = doshas.find((d) => d.name.startsWith("Kaal Sarp"));
  para(ks?.present ? `Your horoscope contains Kaal Sarp Yoga. ${ks.details}` : `Your horoscope does not contain Kaal Sarp Yoga. ${ks?.severity === "Mild" ? "A partial influence (six planets on one side of the Rahu-Ketu axis) is noted, which is mild." : "The planets are spread on both sides of the Rahu-Ketu axis."}`);
  if (ks?.present) para("Remedies: " + ks.remedies.slice(0, 4).map((r) => r.text).join("; ") + ".", 8);

  title("Sade Sati & Shani Dhaiya Analysis");
  const sadeReport = buildSadeSatiReport(c, currentTransits(), now);
  para(sadeReport.summaryText, 8.3);
  para(sadeReport.dhaiya.summary, 8.1);
  table({
    head: [["Phase", "Saturn Sign", "Start", "End", "Status"]],
    body: sadeReport.phases.map((p) => [p.phase, p.sign, X.dmy(Date.parse(p.start), off), X.dmy(Date.parse(p.end), off), p.status === "current" ? "Running" : p.status]),
    styles: { halign: "center", fontSize: 7.2 },
    didParseCell: (data) => {
      if (data.section === "body" && String((data.row.raw as string[])[4]) === "Running") {
        data.cell.styles.fillColor = PDF_COLORS.cream;
        data.cell.styles.textColor = PDF_COLORS.gold;
        data.cell.styles.fontStyle = "bold";
      }
    },
  });
  para(`Natal Saturn: ${sadeReport.natalSaturn.sign} ${sadeReport.natalSaturn.degree}, house ${sadeReport.natalSaturn.house}, ${sadeReport.natalSaturn.dignity}, strength ${sadeReport.natalSaturn.strength}/100${sadeReport.natalSaturn.retro ? ", retrograde" : ""}. Running Dasha: ${sadeReport.runningDasha.chain.join("-") || "not available"}.`, 8);
  if (sadeReport.remedies.length) para("Traditional practices: " + sadeReport.remedies.slice(0, 5).map((r) => r.text).join("; ") + ".", 7.8);
  para("Maha Mrityunjaya Japa: if followed by your family tradition, chant 'Om Tryambakam Yajamahe Sugandhim Pushtivardhanam, Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat' 108 times daily, or arrange 125,000 recitations only through a trusted priest. This is devotional practice, not medical treatment.", 7.7, true);

  for (const s of X.lifePredictions(c)) {
    title(s.title);
    s.paras.forEach((p) => para(p));
  }

  title("Profession, Father, Status & Power");
  const careerReading = overallPredictions(c, now).find((p) => p.key === "career");
  careerReading?.paragraphs.forEach((p) => para(p));
  const ninthLord = houseLord(c, 9);
  const tenthLord = houseLord(c, 10);
  const ninthPlanet = P(ninthLord);
  const tenthPlanet = P(tenthLord);
  para(`Father, fortune and authority are read from the 9th house and Sun. The 9th lord ${ninthLord} is in house ${ninthPlanet.house} (${dignity(ninthLord, ninthPlanet.sign, ninthPlanet.deg, c)}). Profession and public status are read from the 10th house: its lord ${tenthLord} is in house ${tenthPlanet.house} (${dignity(tenthLord, tenthPlanet.sign, tenthPlanet.deg, c)}), with ${c.planets.filter((p) => p.house === 10).map((p) => p.id).join(", ") || "no planets"} occupying the 10th.`, 8.2);
  para(`The Sun is ${dignity("Sun", P("Sun").sign, P("Sun").deg, c).toLowerCase()} in house ${P("Sun").house}; it describes leadership, confidence, government and the father's influence. Dasamsa and the running Dashas decide when the career promise becomes most visible.`, 8.2);

  const startYear = new Date(now).getUTCFullYear();
  newPage();
  title(`Yearly Predictions (${startYear} - ${startYear + 4})`);
  for (const yp of X.yearlyPredictions(c, startYear, 5)) {
    ensure(40);
    table({ body: [[`Year ${yp.year}`, `Overall: ${yp.score}%`, `Jupiter: ${yp.jH} from Moon`, `Saturn: ${yp.sH} from Moon${yp.sade ? " (Sade Sati)" : ""}`, `Rahu: ${yp.rH} from Moon`]], styles: { fontStyle: "bold", halign: "center", fillColor: [240, 240, 240] } }, 2);
    para(yp.overview);
    table({
      body: [
        ["Profession", yp.career],
        ["Wealth / Property", yp.finance],
        ["House / Family / Society", yp.relations],
        ["Children / Education", yp.children],
        ["Health", yp.health],
        ["Career / Competition", yp.competition],
        ["Travel / Transfer", yp.travel],
        ["Religious Deeds", yp.religion],
      ],
      styles: { fontSize: 7.4 },
      columnStyles: { 0: { fontStyle: "bold", fillColor: PDF_COLORS.blueWash, cellWidth: 38 } },
    }, 3);
    y += 2;
  }
  para("Note: Predictions are based on classical Vedic astrology principles (Parashari system, Vimshottari dasha and transits of Jupiter, Saturn and Rahu from the natal Moon). They indicate tendencies; free will and sincere effort shape the final outcome.", 7.5, true);

  /* ===== headers & footers on every page ===== */
  const pages = doc.getNumberOfPages();
  const genMs = Date.now();
  const serial = `${(Date.parse(c.utc) / 1000).toString(36).toUpperCase().slice(-6)}-${Math.round(c.input.lat * 100)}-${Math.round(c.input.lon * 100)}/${pages}`;
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    // Traditional jewel-tone banner on every page.
    doc.setFillColor(...PDF_COLORS.indigo);
    doc.rect(0, 0, W, 17, "F");
    doc.setFillColor(...PDF_COLORS.saffron);
    doc.rect(0, 16.1, W, 0.9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14.5);
    doc.setTextColor(...PDF_COLORS.white);
    const name = clean(c.input.name);
    doc.text(name, W / 2, 9.5, { align: "center" });
    const nw = doc.getTextWidth(name);
    doc.setDrawColor(...PDF_COLORS.saffron);
    for (let k = 0; k < 3; k++) {
      swastika(doc, W / 2 - nw / 2 - 8 - k * 8.5, 8.4, 2.05);
      swastika(doc, W / 2 + nw / 2 + 8 + k * 8.5, 8.4, 2.05);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.4);
    doc.setTextColor(216, 224, 255);
    doc.text("ZODIAC VEDA  ·  VEDIC ASTROLOGY REPORT", W / 2, 14, { align: "center" });

    // Footer band. Credit is intentionally absent: it belongs only on the homepage.
    doc.setFillColor(...PDF_COLORS.cream);
    doc.rect(0, H - 12, W, 12, "F");
    doc.setDrawColor(...PDF_COLORS.gold);
    doc.setLineWidth(0.35);
    doc.line(0, H - 12, W, H - 12);
    doc.setTextColor(...PDF_COLORS.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("Lahiri sidereal · Whole-sign houses · Traditional Jyotish interpretation", M, H - 6.2);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PDF_COLORS.indigo);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${pages}`, W - M, H - 6.2, { align: "right" });
    if (i === 1) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.6);
      doc.setTextColor(...PDF_COLORS.gold);
      doc.text(clean(`Model: Zodiac Veda - Prediction Pack 5 Years  |  SrNo: ${serial}  |  Generated: ${X.dmy(genMs, off)}`), W / 2, H - 9.3, { align: "center" });
    }
  }
  return { bytes: doc.output("arraybuffer"), filename: reportFileName(c.input.name) };
}
