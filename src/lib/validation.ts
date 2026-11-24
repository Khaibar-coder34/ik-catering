import { z } from "zod";
import { formsContent as copy } from "@/src/lib/content";
import { cateringSettings, earliestCateringDate } from "@/src/lib/catering-settings";

export { todayInAmsterdam } from "@/src/lib/catering-settings";

const messages = copy.validation;
const line = (label: string, max = 160) => z.string().trim()
  .min(1, messages.required.replace("{field}", label))
  .max(max, messages.tooLong.replace("{field}", label))
  .refine((value) => !/[\u0000-\u001f\u007f]/.test(value), messages.singleLine);
const email = z.string().trim().toLowerCase().max(254, messages.email).email(messages.email);
const phone = line(copy.fields.phone, 40).regex(/^[+\d().\s-]+$/, messages.phone)
  .refine((value) => value.replace(/\D/g, "").length >= 7, messages.phone);
const id = z.string().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, messages.date)
  .refine((value) => {
    const parsed = new Date(`${value}T12:00:00Z`);
    return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
  }, messages.date);

const common = {
  requestId: z.string().uuid(messages.refresh).toLowerCase(),
  startedAt: z.number().int().positive(),
  website: z.string().max(200).default(""),
  turnstileToken: z.string().max(2048).default(""),
  audience: z.enum(["private", "business"], { error: messages.audience }),
  name: line(copy.fields.name, 100),
  email,
  phone,
};

export const quoteSchema = z.object({
  ...common,
  kind: z.literal("quote"),
  city: line(copy.fields.city, 100),
  people: z.number({ error: messages.people }).int(messages.wholePeople)
    .min(cateringSettings.minPeople, messages.minimumPeople.replace("{minPeople}", String(cateringSettings.minPeople))),
  date,
  dishIds: z.array(id).max(100).default([]),
  tableware: z.enum(["yes", "no"], { error: messages.tableware }),
  privacy: z.literal(true, { error: messages.privacy }),
}).strict();

export const contactSchema = z.object({
  ...common,
  kind: z.literal("contact"),
  message: z.string().trim().min(1, messages.message).max(4000, messages.textTooLong)
    .refine((value) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value), messages.invalidCharacters),
}).strict();

export function createRequestSchema(now: () => Date = () => new Date()) {
  return z.discriminatedUnion("kind", [quoteSchema, contactSchema]).superRefine((value, context) => {
    if (value.kind === "quote" && value.date && value.date < earliestCateringDate(now())) {
      context.addIssue({ code: "custom", path: ["date"], message: messages.leadDays.replace("{leadDays}", String(cateringSettings.leadDays)) });
    }
  });
}

export const requestSchema = createRequestSchema();

export type CateringRequest = z.infer<typeof requestSchema>;
export type RequestKind = CateringRequest["kind"];
export type Audience = CateringRequest["audience"];

export function validationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}
