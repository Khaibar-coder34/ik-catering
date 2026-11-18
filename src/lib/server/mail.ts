import "server-only";
import { Resend } from "resend";
import { z } from "zod";
import { createSubmissionService, type MailTransport } from "@/src/lib/server/submission-service";
import { site } from "@/src/lib/site";

const mailConfiguration = z.object({
  apiKey: z.string().min(1),
  from: z.string().trim().email(),
  to: z.string().trim().email(),
});

export function getMailConfiguration() {
  return mailConfiguration.safeParse({
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.RESEND_FROM_EMAIL,
    to: process.env.NOTIFICATION_TO_EMAIL || site.email,
  });
}

export function createConfiguredSubmissionService() {
  const config = getMailConfiguration();
  if (!config.success) return null;
  // Quote display names so commas and quotes cannot change the mailbox syntax.
  const senderName = site.name.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const resend = new Resend(config.data.apiKey);
  const transport: MailTransport = {
    async send(message, idempotencyKey) {
      const { data, error } = await resend.emails.send(message, { idempotencyKey, signal: AbortSignal.timeout(12000) });
      if (error) console.error("catering_resend", { code: error.name, status: error.statusCode });
      return { accepted: !error && Boolean(data?.id) };
    },
  };
  return createSubmissionService({
    transport,
    from: `"${senderName}" <${config.data.from}>`,
    to: config.data.to,
    log: (code, reference) => console.error("catering_mail", { code, reference }),
  });
}
