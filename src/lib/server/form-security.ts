import { createHash } from "node:crypto";

export const MAX_REQUEST_BYTES = 32 * 1024;
export class RequestBoundaryError extends Error {
  constructor(public status: number, public code: string) { super(code); this.name = "RequestBoundaryError"; }
}

export interface SecurityConfig {
  origins: string[];
  production: boolean;
  turnstileSiteKey?: string;
  turnstileSecret?: string;
  allowUnprotectedForms?: boolean;
}

export function checkOrigin(request: Request, config: SecurityConfig): string {
  const origin = request.headers.get("origin");
  if (!origin || request.headers.get("sec-fetch-site") === "cross-site") throw new RequestBoundaryError(403, "origin");
  let parsed: URL;
  try { parsed = new URL(origin); } catch { throw new RequestBoundaryError(403, "origin"); }
  if (origin !== parsed.origin) throw new RequestBoundaryError(403, "origin");
  const allowed = new Set(config.origins.flatMap((value) => { try { return [new URL(value).origin]; } catch { return []; } }));
  if (!config.production) {
    const local = new URL(request.url);
    if (["localhost", "127.0.0.1", "[::1]"].includes(local.hostname)) allowed.add(local.origin);
  }
  if (!allowed.has(origin)) throw new RequestBoundaryError(403, "origin");
  return parsed.hostname;
}

export async function readBoundedJson(request: Request): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") {
    throw new RequestBoundaryError(415, "content_type");
  }
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > MAX_REQUEST_BYTES)) throw new RequestBoundaryError(413, "too_large");
  if (!request.body) throw new RequestBoundaryError(400, "invalid_json");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_REQUEST_BYTES) { await reader.cancel(); throw new RequestBoundaryError(413, "too_large"); }
      chunks.push(value);
    }
    const result = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.byteLength; }
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(result));
  } catch (error) {
    if (error instanceof RequestBoundaryError) throw error;
    throw new RequestBoundaryError(400, "invalid_json");
  } finally { reader.releaseLock(); }
}

// Best-effort, per warm server instance; Turnstile is the production bot boundary.
// This is deliberately not presented as a distributed rate limit.
export function createRateLimiter(now: () => number = Date.now) {
  const attempts = new Map<string, { count: number; expires: number }>();
  return (identity: string): boolean => {
    const key = createHash("sha256").update(identity).digest("hex");
    for (const [id, value] of attempts) if (value.expires <= now()) attempts.delete(id);
    const current = attempts.get(key);
    if (current) { current.count += 1; return current.count <= 5; }
    if (attempts.size >= 2000) attempts.delete(attempts.keys().next().value!);
    attempts.set(key, { count: 1, expires: now() + 10 * 60 * 1000 });
    return true;
  };
}

export function checkSecurityConfiguration(config: SecurityConfig) {
  const site = Boolean(config.turnstileSiteKey);
  const secret = Boolean(config.turnstileSecret);
  if (site !== secret) throw new RequestBoundaryError(503, "security_configuration");
  if (config.production && !site && !config.allowUnprotectedForms) throw new RequestBoundaryError(503, "security_configuration");
}

export async function verifyTurnstile(token: string, hostname: string, config: SecurityConfig, fetcher: typeof fetch = fetch): Promise<boolean> {
  checkSecurityConfiguration(config);
  if (!config.turnstileSecret) return true;
  if (!token) return false;
  try {
    const response = await fetcher("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: config.turnstileSecret, response: token }),
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
    if (!response.ok) return false;
    const result: unknown = await response.json();
    if (!result || typeof result !== "object") return false;
    const verified = result as { success?: unknown; hostname?: unknown; action?: unknown };
    return verified.success === true && verified.hostname === hostname && verified.action === "catering_request";
  } catch { return false; }
}
