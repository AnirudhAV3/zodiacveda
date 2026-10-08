import { BirthInputError, validateBirthDetails } from "@/lib/calculators/birth";
import type { BirthInput } from "@/lib/astro/calc";

/** Marriage matching uses the shared calculator validation; this wrapper keeps its original API. */
export { BirthInputError as MatchInputError };

export function validateMatchBirth(value: unknown, label: string, style: "north" | "south"): BirthInput {
  return validateBirthDetails(value, label, style);
}
