import { z } from "zod";
import rawSite from "@/src/data/site.json";
import { content } from "@/src/lib/content";

const siteSchema = z.object({
  name: z.string().min(1), legalName: z.string().min(1), legalForm: z.string().min(1), foundedYear: z.number().int().min(1900).max(2100), tagline: z.string(), email: z.email(),
  phone: z.string(), address: z.string(), postalCode: z.string(), city: z.string(),
  kvk: z.string(), vat: z.string(),
  socials: z.array(z.object({ label: z.string(), href: z.url() })),
  url: z.url(), serviceArea: z.string(),
  navigation: z.array(z.object({ label: z.string(), href: z.string().startsWith("/") })),
  quoteLabel: z.string(), footer: z.record(z.string(), z.string()), ui: z.record(z.string(), z.string()),
});

export const site = siteSchema.parse(rawSite);
export { content };
const phoneDigits = site.phone.replace(/\D/g, "");
const internationalPhone = phoneDigits.startsWith("00") ? phoneDigits.slice(2) : phoneDigits.startsWith("0") ? `31${phoneDigits.slice(1)}` : phoneDigits;
export const whatsappUrl = internationalPhone ? `https://wa.me/${internationalPhone}` : "";
const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || site.url;
const parsedUrl = new URL(configuredUrl);
if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTP(S) URL");
export const siteUrl = parsedUrl.origin;
