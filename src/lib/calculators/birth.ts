import { randomUUID } from "node:crypto";
import { localToUtc, tzOffsetMinutes, type BirthInput, type ChartData } from "@/lib/astro/calc";

/** Shared birth-detail validation for every calculator, so one engine and one rule set is used everywhere. */
export class BirthInputError extends Error {}
const fail = (message: string): never => {
  throw new BirthInputError(message);
};

export function validateBirthDetails(value: unknown, label: string, style: "north" | "south"): BirthInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label}: birth details are required.`);
  const b = value as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const date = typeof b.date === "string" ? b.date : "";
  const time = typeof b.time === "string" ? b.time : "";
  const place = typeof b.place === "string" ? b.place.trim() : "";
  const tz = typeof b.tz === "string" ? b.tz.trim() : "";
  if (!name || name.length > 80) fail(`${label}: enter a name of 1–80 characters.`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(`${label}: enter a valid date of birth.`);
  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (year < 1800 || year > 2100 || parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) fail(`${label}: the date of birth does not exist.`);
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) fail(`${label}: use 24-hour time HH:MM, for example 15:04.`);
  if (!place || place.length > 160) fail(`${label}: select a birth place or enter its name with coordinates.`);
  if (typeof b.lat !== "number" || !Number.isFinite(b.lat) || b.lat <= -90 || b.lat >= 90) fail(`${label}: a valid latitude between -90 and 90 is required.`);
  if (typeof b.lon !== "number" || !Number.isFinite(b.lon) || b.lon < -180 || b.lon > 180) fail(`${label}: a valid longitude between -180 and 180 is required.`);
  if (!tz || tz.length > 80) fail(`${label}: a valid time zone is required.`);
  const fixed = tz.match(/^(?:UTC|GMT)?\s*([+-])(\d{1,2})(?::?(\d{2}))?$/i);
  if (fixed && (+fixed[2] > 14 || +(fixed[3] ?? "0") > 59 || (+fixed[2] === 14 && +(fixed[3] ?? "0") !== 0))) fail(`${label}: UTC offset must be between -14:00 and +14:00.`);
  let utc: number;
  let offset: number;
  try {
    utc = localToUtc(date, time, tz).utc;
    offset = tzOffsetMinutes(tz, utc);
  } catch {
    return fail(`${label}: invalid time zone. Use an IANA zone such as Asia/Kolkata, or UTC+05:30.`);
  }
  if (!Number.isFinite(utc) || !Number.isFinite(offset)) fail(`${label}: birth time could not be converted.`);
  if (new Date(utc + offset * 60000).toISOString().slice(0, 16) !== `${date}T${time}`) fail(`${label}: that local time does not exist in the selected time zone (daylight-saving transition).`);
  if (utc > Date.now()) fail(`${label}: date and time of birth cannot be in the future.`);
  return { name, date, time, place, lat: b.lat as number, lon: b.lon as number, tz, style, gender: b.gender === "female" ? "female" : "male" };
}

export const calculatorSlug = () => randomUUID().replace(/-/g, "");

export function chartRow(c: ChartData, slug: string) {
  const i = c.input;
  return { slug, name: i.name, gender: i.gender, birthDate: i.date, birthTime: i.time, place: i.place, latitude: i.lat, longitude: i.lon, timezone: i.tz, chartStyle: i.style, data: c };
}

/** Guards against saving a chart whose positions failed to calculate. */
export function assertUsableChart(c: ChartData, label: string) {
  if (!Number.isFinite(c.asc.lon) || c.planets.some((p) => !Number.isFinite(p.lon) || !Number.isFinite(p.deg))) {
    fail(`${label}: planetary positions could not be calculated. Please verify the birth details.`);
  }
}
