import type { CateringRequest } from "@/src/lib/validation";
import { formsContent as copy } from "@/src/lib/content";

export interface ResolvedMenu { dishNames: string[] }
const emailCopy = copy.email;

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]!));
}

function rowsFor(request: CateringRequest, menu: ResolvedMenu): [string, string][] {
  const rows: [string, string][] = [
    [emailCopy.audienceLabel, copy.audiences[request.audience]],
    [copy.fields.name, request.name], [copy.fields.email, request.email], [copy.fields.phone, request.phone],
  ];
  if (request.kind === "quote") {
    rows.push(
      [copy.fields.city, request.city], [copy.fields.people, String(request.people)], [copy.fields.date, request.date],
      [emailCopy.selectionLabel, menu.dishNames.length ? menu.dishNames.join(", ") : emailCopy.menuAdvice],
      [copy.fields.tableware, copy.tablewareOptions.find((option) => option.value === request.tableware)!.label],
      [emailCopy.privacyLabel, emailCopy.privacyAgreed],
    );
  } else {
    // Contact requests have a privacy information link, not a consent checkbox.
    rows.push([copy.fields.message, request.message]);
  }
  return rows;
}

function frame(heading: string, introduction: string, rows: [string, string][], reference: string) {
  const text = [
    `${emailCopy.brand.toUpperCase()} — ${emailCopy.tagline}`, heading, introduction,
    `${emailCopy.referenceLabel}: ${reference}`, ...rows.map(([label, value]) => `${label}: ${value}`), emailCopy.footer,
  ].join("\n\n");
  const html = `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body style="margin:0;background:#FAF7F0;color:#272320;font-family:Arial,sans-serif;line-height:1.6"><table role="presentation" style="width:100%;border-collapse:collapse"><tr><td style="padding:32px 16px"><table role="presentation" style="width:100%;max-width:620px;margin:auto;border-collapse:collapse;background:#fff"><tr><td style="padding:28px 32px;background:#601E2A;color:#fff"><p style="margin:0;font-family:Georgia,serif;font-size:27px">${escapeHtml(emailCopy.brand)}</p><p style="margin:4px 0 0;letter-spacing:2px;font-size:11px;color:#e8d3aa">${escapeHtml(emailCopy.tagline)}</p></td></tr><tr><td style="padding:32px"><h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;color:#601E2A;margin:0 0 16px">${escapeHtml(heading)}</h1><p>${escapeHtml(introduction)}</p><p style="font-size:13px;color:#62584d">${escapeHtml(emailCopy.referenceLabel)}: ${escapeHtml(reference)}</p><table style="width:100%;border-collapse:collapse">${rows.map(([label, value]) => `<tr><th scope="row" style="text-align:left;vertical-align:top;width:37%;font-size:13px;padding:12px 12px 12px 0;border-bottom:1px solid #eee6dc;font-weight:600">${escapeHtml(label)}</th><td style="vertical-align:top;font-size:14px;word-break:break-word;padding:12px 0;border-bottom:1px solid #eee6dc;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join("")}</table><p style="margin-top:28px;font-size:13px;color:#62584d">${escapeHtml(emailCopy.footer)}</p></td></tr></table></td></tr></table></body></html>`;
  return { html, text };
}

export function buildRequestEmails(request: CateringRequest, menu: ResolvedMenu, reference: string) {
  const type = emailCopy.types[request.kind];
  const audience = copy.audiences[request.audience];
  const rows = rowsFor(request, menu);
  return {
    internal: {
      subject: `${type} · ${audience} · ${reference}`,
      ...frame(`${emailCopy.internalHeading} · ${audience}`, emailCopy.internalIntro, rows, reference),
    },
    confirmation: {
      subject: `${emailCopy.confirmationSubjectPrefix} ${type.toLowerCase()} ${emailCopy.confirmationSubjectSuffix} · ${audience} · ${reference}`,
      ...frame(emailCopy.confirmationHeading, request.kind === "quote" ? emailCopy.quoteConfirmation : emailCopy.contactConfirmation, rows, reference),
    },
  };
}
