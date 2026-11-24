import { z } from "zod";
import settings from "@/src/data/catering-settings.json";

export const cateringSettings = z.object({
  minPeople: z.number().int().min(1),
  leadDays: z.number().int().min(0),
}).strict().parse(settings);

/** Calendar dates are always based on the business timezone, not the visitor's. */
export function todayInAmsterdam(now = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** Add calendar days to the Amsterdam date. DST days are not assumed to last 24h. */
export function earliestCateringDate(now = new Date()): string {
  const date = new Date(`${todayInAmsterdam(now)}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + cateringSettings.leadDays);
  return date.toISOString().slice(0, 10);
}
