import site from "@/src/data/site.json";
import rawContent from "@/src/data/content.json";
import rawFormsContent from "@/src/data/forms-content.json";

type SiteTokenValues = Pick<typeof site, "name" | "email" | "phone" | "address" | "postalCode" | "city" | "serviceArea" | "url">;

/** Resolve public business details in JSON copy without changing runtime placeholders. */
export function resolveSiteTokens<T>(value: T, details: SiteTokenValues = site): T {
  if (typeof value === "string") {
    return value.replace(/\{site\.(name|email|phone|address|postalCode|city|serviceArea|url)\}/g,
      (_token, key: keyof SiteTokenValues) => details[key]) as T;
  }
  if (Array.isArray(value)) return value.map((entry) => resolveSiteTokens(entry, details)) as T;
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, resolveSiteTokens(entry, details)])) as T;
  }
  return value;
}

export const content = resolveSiteTokens(rawContent);
export const formsContent = resolveSiteTokens(rawFormsContent);
