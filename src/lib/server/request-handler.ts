import { createRequestSchema, validationErrors, type CateringRequest } from "@/src/lib/validation";
import type { ResolvedMenu } from "@/src/emails/request-email";
import { SubmissionError, type Receipt } from "@/src/lib/server/submission-service";
import { checkOrigin, checkSecurityConfiguration, readBoundedJson, RequestBoundaryError, type SecurityConfig } from "@/src/lib/server/form-security";
import { formsContent as copy } from "@/src/lib/content";

interface HandlerOptions {
  security: SecurityConfig;
  isMailConfigured: () => boolean;
  rateLimit: (identity: string) => boolean;
  verifyToken: (token: string, hostname: string) => Promise<boolean>;
  resolveMenu: (request: CateringRequest) => ResolvedMenu;
  submit: (request: CateringRequest, menu: ResolvedMenu) => Promise<Receipt>;
  now?: () => number;
  log?: (code: string) => void;
}

function json(body: unknown, status = 200, extraHeaders?: HeadersInit) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...extraHeaders } });
}

const messages = copy.apiErrors;

export function createRequestHandler(options: HandlerOptions) {
  const now = options.now ?? Date.now;
  const schema = createRequestSchema(() => new Date(now()));
  return async function handleRequest(request: Request): Promise<Response> {
    try {
      const hostname = checkOrigin(request, options.security);
      const identity = request.headers.get("x-nf-client-connection-ip") ?? "local-unknown";
      if (!options.rateLimit(identity)) return json({ ok: false, code: "rate_limit", message: messages.rateLimit }, 429, { "Retry-After": "600" });
      const raw = await readBoundedJson(request);
      const parsed = schema.safeParse(raw);
      if (!parsed.success) return json({ ok: false, code: "validation", message: copy.validationMessage, fieldErrors: validationErrors(parsed.error) }, 422);
      const data = parsed.data;
      const elapsed = now() - data.startedAt;
      if (data.website !== "" || elapsed < 1500 || elapsed > 24 * 60 * 60 * 1000) return json({ ok: false, code: "form_check", message: messages.formCheck }, 400);

      let menu: ResolvedMenu;
      try { menu = options.resolveMenu(data); }
      catch { return json({ ok: false, code: "selection", message: messages.selection }, 422); }

      checkSecurityConfiguration(options.security);
      if (!options.isMailConfigured()) return json({ ok: false, code: "mail_configuration", message: messages.configuration }, 503);
      if (!(await options.verifyToken(data.turnstileToken, hostname))) return json({ ok: false, code: "verification", message: messages.verification }, 422);

      const receipt = await options.submit(data, menu);
      return json({ ok: true, ...receipt });
    } catch (error) {
      if (error instanceof RequestBoundaryError) {
        if (error.status === 503) options.log?.(error.code);
        return json({ ok: false, code: error.code, message: error.status === 503 ? messages.configuration : error.status === 413 ? messages.tooLarge : messages.invalidRequest }, error.status);
      }
      if (error instanceof SubmissionError) return json({ ok: false, code: error.code, message: error.code === "request_conflict" ? messages.conflict : messages.retry }, error.code === "request_conflict" ? 409 : 502);
      options.log?.("unexpected_request_failure");
      return json({ ok: false, code: "unavailable", message: messages.retry }, 503);
    }
  };
}
