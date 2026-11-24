import assert from "node:assert/strict";
import test from "node:test";
import site from "../src/data/site.json";
import rawContent from "../src/data/content.json";
import rawFormsContent from "../src/data/forms-content.json";
import { content, formsContent, resolveSiteTokens } from "../src/lib/content";
import { buildRequestEmails, escapeHtml } from "../src/emails/request-email";
import { requestSchema } from "../src/lib/validation";

test("gewijzigde bedrijfsgegevens verschijnen in privacy, formuliermeldingen en e-mailteksten", () => {
  const replacement = { ...site, name: "Nieuwe Keuken", email: "contact@example.org", address: "Voorbeeldstraat 42", city: "Amersfoort", phone: "0612345678" };
  const updatedContent = resolveSiteTokens(rawContent, replacement);
  const updatedForms = resolveSiteTokens(rawFormsContent, replacement);
  const privacy = updatedContent.privacy.sections[0].text;
  for (const value of [replacement.name, replacement.email, replacement.address, replacement.city, replacement.phone]) assert.ok(privacy.includes(value));
  for (const value of [site.email, site.address, site.phone]) assert.ok(!privacy.includes(value));
  for (const message of [updatedForms.networkError, updatedForms.verificationError, updatedForms.apiErrors.configuration, updatedForms.apiErrors.retry, updatedForms.apiErrors.rateLimit]) {
    assert.ok(message.includes(replacement.email));
    assert.ok(!message.includes(site.email));
  }
  assert.equal(updatedForms.email.brand, replacement.name);
  assert.equal(updatedForms.email.footer, `${replacement.name} · ${replacement.city} · ${replacement.email}`);
  for (const template of Object.values(updatedForms.email.confirmations)) assert.ok(template.subject.includes(replacement.name));
  assert.ok(rawContent.privacy.sections[0].text.includes("{site.email}"));
});

test("bedrijfsvervanging behoudt invoervelden, aantallen en onbekende placeholders", () => {
  const source = { nested: ["{site.name}: {count} gerechten", "{field} is verplicht.", "{site.unknown}"], enabled: true, empty: null, count: 3 };
  const resolved = resolveSiteTokens(source);
  assert.deepEqual(resolved, { nested: [`${site.name}: {count} gerechten`, "{field} is verplicht.", "{site.unknown}"], enabled: true, empty: null, count: 3 });
  assert.equal(formsContent.selectedSummary, rawFormsContent.selectedSummary);
  assert.equal(formsContent.validation.required, rawFormsContent.validation.required);
});

test("juridische bedrijfsnaam, oprichtingsjaar en cateringvoorwaarden worden centraal ingevuld", () => {
  const replacement = { ...site, legalName: "Voorbeeld Keuken VOF", legalForm: "VOF", foundedYear: 2021 };
  assert.equal(resolveSiteTokens("{site.legalName} ({site.legalForm}) sinds {site.foundedYear}", replacement), "Voorbeeld Keuken VOF (VOF) sinds 2021");
  const updated = resolveSiteTokens(rawContent, replacement, { minPeople: 24, leadDays: 5 });
  assert.equal(updated.home.note, "Vanaf 24 personen · Minimaal 5 dagen vooraf aanvragen");
  assert.ok(updated.about.description.includes("2021"));
});

test("actieve pagina- en e-mailinhoud bevat uitgewerkte bedrijfsgegevens", () => {
  const request = requestSchema.parse({ kind: "contact", requestId: "1c72a07c-cc52-4674-ac92-e7fe3e288d7f", startedAt: Date.now() - 5000, audience: "private", name: "Testpersoon", email: "test@example.com", phone: "0612345678", message: "Graag meer informatie." });
  const email = buildRequestEmails(request, { dishNames: [] }, "IK-CONTENT-TEST");
  assert.ok(content.about.description.includes(site.name));
  assert.ok(email.confirmation.subject.includes(site.name));
  for (const message of [email.internal, email.confirmation]) {
    assert.ok(message.text.includes(formsContent.email.footer));
    assert.ok(message.html.includes(escapeHtml(formsContent.email.footer)));
    assert.ok(!message.html.includes("{site."));
    assert.ok(!message.text.includes("{site."));
  }
});
