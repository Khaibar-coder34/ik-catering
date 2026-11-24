import site from "@/src/data/site.json";
import rawContent from "@/src/data/content.json";
import rawFormsContent from "@/src/data/forms-content.json";
import { cateringSettings } from "@/src/lib/catering-settings";

type SiteTokenValues = Pick<typeof site, "name" | "legalName" | "legalForm" | "foundedYear" | "kvk" | "vat" | "email" | "phone" | "address" | "postalCode" | "city" | "serviceArea" | "url">;

/** Resolve public business details in JSON copy without changing runtime placeholders. */
export function resolveSiteTokens<T>(value: T, details: SiteTokenValues = site, catering = cateringSettings): T {
  if (typeof value === "string") {
    return value.replace(/\{site\.(name|legalName|legalForm|foundedYear|kvk|vat|email|phone|address|postalCode|city|serviceArea|url)\}/g,
      (_token, key: keyof SiteTokenValues) => String(details[key]))
      .replace(/\{catering\.(minPeople|leadDays)\}/g,
        (_token, key: keyof typeof catering) => String(catering[key])) as T;
  }
  if (Array.isArray(value)) return value.map((entry) => resolveSiteTokens(entry, details, catering)) as T;
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, resolveSiteTokens(entry, details, catering)])) as T;
  }
  return value;
}

export const content = resolveSiteTokens(rawContent);
export const formsContent = resolveSiteTokens(rawFormsContent);
