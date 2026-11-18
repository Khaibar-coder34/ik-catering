import "server-only";
import { getCatalog } from "@/src/lib/catalog";
import { validateSelection, resolveSelection } from "@/src/lib/selection";
import { createRequestHandler } from "@/src/lib/server/request-handler";
import { createRateLimiter, verifyTurnstile, type SecurityConfig } from "@/src/lib/server/form-security";
import { createConfiguredSubmissionService, getMailConfiguration } from "@/src/lib/server/mail";
import { site } from "@/src/lib/site";

export const runtime = "nodejs";

const security: SecurityConfig = {
  origins: [process.env.NEXT_PUBLIC_SITE_URL || site.url, process.env.URL, process.env.DEPLOY_PRIME_URL, process.env.DEPLOY_URL].filter((value): value is string => Boolean(value)),
  production: process.env.NODE_ENV === "production",
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  turnstileSecret: process.env.TURNSTILE_SECRET_KEY,
  allowUnprotectedForms: process.env.ALLOW_UNPROTECTED_FORMS === "true",
};
const rateLimit = createRateLimiter();
let submissionService: ReturnType<typeof createConfiguredSubmissionService>;

export const POST = createRequestHandler({
  security,
  isMailConfigured: () => getMailConfiguration().success,
  rateLimit,
  verifyToken: (token, hostname) => verifyTurnstile(token, hostname, security),
  resolveMenu: (request) => {
    if (request.kind !== "quote") return { dishNames: [] };
    const catalog = getCatalog();
    const selection = validateSelection(catalog, { dishIds: request.dishIds, arrangementId: null, arrangementDishIds: [] });
    const resolved = resolveSelection(catalog, selection);
    return {
      dishNames: resolved.dishes.map((dish) => dish.name),
    };
  },
  submit: async (request, menu) => {
    submissionService ??= createConfiguredSubmissionService();
    if (!submissionService) throw new Error("mail_not_configured");
    return submissionService(request, menu);
  },
  log: (code) => console.error("catering_request", { code }),
});
