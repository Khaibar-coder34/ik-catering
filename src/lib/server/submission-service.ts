import { createHash } from "node:crypto";
import { buildRequestEmails, type ResolvedMenu } from "@/src/emails/request-email";
import type { CateringRequest } from "@/src/lib/validation";

export interface MailMessage { from: string; to: string; replyTo?: string; subject: string; html: string; text: string }
export interface MailTransport { send(message: MailMessage, idempotencyKey: string): Promise<{ accepted: boolean }> }
export interface Receipt { reference: string; confirmationSent: boolean }
export class SubmissionError extends Error {
  constructor(public code: "delivery_failed" | "request_conflict") { super(code); this.name = "SubmissionError"; }
}
export interface SubmissionOptions {
  transport: MailTransport;
  from: string;
  to: string;
  log?: (code: string, reference: string) => void;
  now?: () => number;
}

// Only short-lived hashes and receipts are kept in this bounded warm-instance cache.
// Resend's idempotency keys provide duplicate-send protection across instances (24h).
export function createSubmissionService(options: SubmissionOptions) {
  const receipts = new Map<string, { hash: string; expires: number; promise: Promise<Receipt> }>();
  const now = options.now ?? Date.now;

  return async (request: CateringRequest, menu: ResolvedMenu): Promise<Receipt> => {
    const reference = `IK-${request.requestId.toUpperCase()}`;
    const { startedAt: _startedAt, website: _website, turnstileToken: _token, ...content } = request;
    void _startedAt; void _website; void _token;
    const hash = createHash("sha256").update(JSON.stringify({ content, menu })).digest("hex");
    for (const [key, value] of receipts) if (value.expires < now()) receipts.delete(key);
    const existing = receipts.get(request.requestId);
    if (existing) {
      if (existing.hash !== hash) throw new SubmissionError("request_conflict");
      return existing.promise;
    }
    if (receipts.size >= 1000) receipts.delete(receipts.keys().next().value!);

    const perform = async (): Promise<Receipt> => {
      const emails = buildRequestEmails(request, menu, reference);
      let accepted = false;
      try {
        accepted = (await options.transport.send({ from: options.from, to: options.to, replyTo: request.email, ...emails.internal }, `ik/${request.kind}/${request.requestId}/internal`)).accepted;
      } catch { options.log?.("internal_transport_failed", reference); }
      if (!accepted) {
        options.log?.("internal_not_accepted", reference);
        throw new SubmissionError("delivery_failed");
      }

      let confirmationSent = false;
      try {
        confirmationSent = (await options.transport.send({ from: options.from, to: request.email, replyTo: options.to, ...emails.confirmation }, `ik/${request.kind}/${request.requestId}/confirmation`)).accepted;
      } catch { options.log?.("confirmation_transport_failed", reference); }
      if (!confirmationSent) options.log?.("confirmation_not_accepted", reference);
      return { reference, confirmationSent };
    };

    const promise = perform();
    receipts.set(request.requestId, { hash, expires: now() + 24 * 60 * 60 * 1000, promise });
    try { return await promise; }
    catch (error) { receipts.delete(request.requestId); throw error; }
  };
}
