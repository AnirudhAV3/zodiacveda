/** Every ISO 639-1 language code — the standard set of written world languages for UI pickers. */
export const LANGUAGE_CODES = [
  "aa", "ab", "ae", "af", "ak", "am", "an", "ar", "as", "av", "ay", "az",
  "ba", "be", "bg", "bi", "bm", "bn", "bo", "br", "bs",
  "ca", "ce", "ch", "co", "cr", "cs", "cu", "cv", "cy",
  "da", "de", "dv", "dz",
  "ee", "el", "en", "eo", "es", "et", "eu",
  "fa", "ff", "fi", "fj", "fo", "fr", "fy",
  "ga", "gd", "gl", "gn", "gu", "gv",
  "ha", "he", "hi", "ho", "hr", "ht", "hu", "hy", "hz",
  "ia", "id", "ie", "ig", "ii", "ik", "io", "is", "it", "iu",
  "ja", "jv",
  "ka", "kg", "ki", "kj", "kk", "kl", "km", "kn", "ko", "kr", "ks", "ku", "kv", "kw", "ky",
  "la", "lb", "lg", "li", "ln", "lo", "lt", "lu", "lv",
  "mg", "mh", "mi", "mk", "ml", "mn", "mr", "ms", "mt", "my",
  "na", "nb", "nd", "ne", "ng", "nl", "nn", "no", "nr", "nv", "ny",
  "oc", "oj", "om", "or", "os",
  "pa", "pi", "pl", "ps", "pt",
  "qu",
  "rm", "rn", "ro", "ru", "rw",
  "sa", "sc", "sd", "se", "sg", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr", "ss", "st", "su", "sv", "sw",
  "ta", "te", "tg", "th", "ti", "tk", "tl", "tn", "to", "tr", "ts", "tt", "tw", "ty",
  "ug", "uk", "ur", "uz",
  "ve", "vi", "vo",
  "wa", "wo",
  "xh",
  "yi", "yo",
  "za", "zh", "zu",
] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export const DEFAULT_LANGUAGE: LanguageCode = "en";
export const LANGUAGE_STORAGE_KEY = "zodiacveda:language";

const PINNED: LanguageCode[] = [
  "en", "hi", "te", "ta", "kn", "ml", "mr", "gu", "pa", "bn", "or", "ur", "as", "sa",
  "es", "ar", "zh", "fr", "pt", "ru", "ja", "ko", "de", "it", "tr", "vi", "id", "th", "pl", "uk", "nl", "sv",
];

export interface LanguageOption {
  code: LanguageCode;
  english: string;
  native: string;
}

function displayName(code: string, of: string) {
  try {
    return new Intl.DisplayNames([code], { type: "language" }).of(of) || of;
  } catch {
    return of;
  }
}

export function languageOption(code: LanguageCode): LanguageOption {
  const english = displayName("en", code);
  const native = displayName(code, code);
  return { code, english, native };
}

export function allLanguages(): LanguageOption[] {
  const pinned = new Set<string>(PINNED);
  const rest = LANGUAGE_CODES.filter((c) => !pinned.has(c)).map(languageOption)
    .sort((a, b) => a.english.localeCompare(b.english, "en"));
  return [...PINNED.map(languageOption), ...rest];
}

export function isLanguageCode(value: string): value is LanguageCode {
  return (LANGUAGE_CODES as readonly string[]).includes(value);
}
