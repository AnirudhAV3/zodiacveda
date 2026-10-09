export type BirthProfileDetails = {
  name: string;
  gender: "male" | "female";
  date: string;
  time: string;
  place: string;
  lat: string;
  lon: string;
  tz: string;
};

export type SavedBirthProfile = BirthProfileDetails & {
  id: string;
  savedAt: string;
};

const KEY = "zodiacveda:saved-profiles:v1";
const MAX_PROFILES = 50;
export const SAVED_PROFILES_CHANGED_EVENT = "zv-profiles-updated";

function isSavedProfile(value: unknown): value is SavedBirthProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Record<string, unknown>;
  return typeof profile.id === "string"
    && typeof profile.savedAt === "string"
    && typeof profile.name === "string"
    && (profile.gender === "male" || profile.gender === "female")
    && typeof profile.date === "string"
    && typeof profile.time === "string"
    && typeof profile.place === "string"
    && typeof profile.lat === "string"
    && typeof profile.lon === "string"
    && typeof profile.tz === "string";
}

export function listSavedProfiles(): SavedBirthProfile[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("Saved profiles could not be read. Clear the invalid profile data and try again.");
  return parsed.filter(isSavedProfile).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

function normalized(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function isDuplicate(existing: SavedBirthProfile, details: BirthProfileDetails) {
  return existing.gender === details.gender
    && existing.date === details.date
    && existing.time === details.time
    && normalized(existing.name) === normalized(details.name)
    && normalized(existing.place) === normalized(details.place)
    && Number(existing.lat) === Number(details.lat)
    && Number(existing.lon) === Number(details.lon)
    && normalized(existing.tz) === normalized(details.tz);
}

export function saveBirthProfile(details: BirthProfileDetails): { status: "saved" | "duplicate"; profile?: SavedBirthProfile } {
  if (!details.name.trim()) throw new Error("Enter a name before saving this profile.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(details.date) || Number.isNaN(Date.parse(`${details.date}T00:00:00`))) {
    throw new Error("Enter a valid date of birth before saving this profile.");
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(details.time)) throw new Error("Enter the birth time in 24-hour HH:MM format.");
  if (!details.place.trim() || !details.tz.trim()) throw new Error("Select a birth place before saving this profile.");
  const lat = Number(details.lat);
  const lon = Number(details.lon);
  if (!details.lat.trim() || !details.lon.trim() || !Number.isFinite(lat) || lat <= -90 || lat >= 90 || !Number.isFinite(lon) || lon < -180 || lon > 180) {
    throw new Error("Select a valid birth place or enter valid coordinates before saving this profile.");
  }
  const existing = listSavedProfiles();
  const duplicate = existing.find((profile) => isDuplicate(profile, details));
  if (duplicate) return { status: "duplicate", profile: duplicate };
  if (existing.length >= MAX_PROFILES) throw new Error(`You can save up to ${MAX_PROFILES} profiles in this browser.`);

  const profile: SavedBirthProfile = {
    ...details,
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(KEY, JSON.stringify([profile, ...existing]));
  return { status: "saved", profile };
}

export function removeSavedProfile(id: string): boolean {
  const profiles = listSavedProfiles();
  const next = profiles.filter((profile) => profile.id !== id);
  if (next.length === profiles.length) return false;
  localStorage.setItem(KEY, JSON.stringify(next));
  return true;
}
