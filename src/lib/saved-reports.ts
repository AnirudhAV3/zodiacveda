export type SavedReportLink = {
  url: string;
  title: string;
  savedAt: string;
};

const KEY = "zodiacveda:saved-reports:v1";
const MAX_REPORTS = 40;

function readReports(): SavedReportLink[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item): item is SavedReportLink =>
    Boolean(item)
    && typeof item === "object"
    && typeof item.url === "string"
    && item.url.startsWith("/")
    && !item.url.startsWith("//")
    && typeof item.title === "string"
    && typeof item.savedAt === "string",
  );
}

export function listSavedReports(): SavedReportLink[] {
  try {
    return readReports().sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  } catch {
    return [];
  }
}

export function addSavedReport(url: string, title: string): boolean {
  if (!url.startsWith("/") || url.startsWith("//")) return false;
  try {
    const report = { url, title: title.slice(0, 160), savedAt: new Date().toISOString() };
    const existing = readReports().filter((item) => item.url !== url);
    localStorage.setItem(KEY, JSON.stringify([report, ...existing].slice(0, MAX_REPORTS)));
    return true;
  } catch {
    return false;
  }
}

export function removeSavedReport(url: string): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(readReports().filter((item) => item.url !== url)));
    return true;
  } catch {
    return false;
  }
}
