import test from "node:test";
import assert from "node:assert/strict";
import { createRequestSchema, requestSchema, todayInAmsterdam } from "../src/lib/validation";
import { cateringSettings, earliestCateringDate } from "../src/lib/catering-settings";
import { createRequestHandler } from "../src/lib/server/request-handler";
import { createSubmissionService, SubmissionError, type MailMessage } from "../src/lib/server/submission-service";
import { checkOrigin, checkSecurityConfiguration, createRateLimiter, MAX_REQUEST_BYTES, readBoundedJson, RequestBoundaryError, verifyTurnstile } from "../src/lib/server/form-security";
import { buildRequestEmails } from "../src/emails/request-email";

const origin = "https://catering.indiasekeuken.nl";
const now = new Date("2026-11-15T12:00:00Z").valueOf();
const emptyMenu = { dishNames: [] };
const reference = "IK-1C72A07C-CC52-4674-AC92-E7FE3E288D7F";
const quote = {
  kind: "quote", requestId: "1c72a07c-cc52-4674-ac92-e7fe3e288d7f", startedAt: now - 5000,
  website: "", turnstileToken: "", audience: "private", name: "Test Contact",
  email: "contact@example.com", phone: "+31 20 000 0000", privacy: true,
  people: 25, date: "2099-12-01", city: "Utrecht", dishIds: [], tableware: "no",
};
const contact = {
  kind: "contact", requestId: quote.requestId, startedAt: quote.startedAt,
  audience: "private", name: quote.name, email: quote.email, phone: quote.phone, message: "Een testbericht",
};

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request(`${origin}/api/aanvragen`, { method: "POST", headers: { "content-type": "application/json", origin, ...headers }, body: JSON.stringify(body) });
}

function handler(overrides: Partial<Parameters<typeof createRequestHandler>[0]> = {}) {
  return createRequestHandler({
    security: { production: false, origins: [origin] }, isMailConfigured: () => true,
    rateLimit: () => true, verifyToken: async () => true, resolveMenu: () => emptyMenu,
    submit: async () => ({ reference, confirmationSent: true }), now: () => now, ...overrides,
  });
}

test("offerte zonder gerechten is geldig", () => {
  const result = requestSchema.safeParse(quote);
  assert.equal(result.success, true);
});

test("aantal personen is verplicht, geheel en minimaal de ingestelde groepsgrootte", () => {
  for (const people of [undefined, 0, -1, 1.5, "25", cateringSettings.minPeople - 1]) {
    assert.equal(requestSchema.safeParse({ ...quote, people }).success, false);
  }
  assert.equal(requestSchema.safeParse({ ...quote, people: cateringSettings.minPeople }).success, true);
  assert.equal(requestSchema.safeParse({ ...quote, people: 100001 }).success, true);
  assert.equal(requestSchema.safeParse({ ...quote, people: Infinity }).success, false);
  assert.equal(requestSchema.safeParse({ ...quote, people: Number.MAX_SAFE_INTEGER + 1 }).success, false);
});

test("datum is verplicht; ontbrekende en ongeldige kalenderdatum worden afgewezen", () => {
  assert.equal(requestSchema.safeParse({ ...quote, date: "" }).success, false);
  assert.equal(requestSchema.safeParse({ ...quote, date: undefined }).success, false);
  assert.equal(requestSchema.safeParse({ ...quote, date: "2099-02-31" }).success, false);
  assert.equal(requestSchema.safeParse({ ...quote, date: "2099-12-01" }).success, true);
});

test("servieskeuze ja of nee is verplicht; onbekend wordt niet geaccepteerd", () => {
  for (const tableware of [undefined, "", "unknown"]) assert.equal(requestSchema.safeParse({ ...quote, tableware }).success, false);
  for (const tableware of ["yes", "no"]) assert.equal(requestSchema.safeParse({ ...quote, tableware }).success, true);
});

test("offerte bevat uitsluitend de vereenvoudigde velden", () => {
  for (const field of ["company", "subject", "message", "dietary", "time", "dateUnknown", "arrangementId"]) {
    assert.equal(requestSchema.safeParse({ ...quote, [field]: "extra" }).success, false);
  }
});

test("daggrens voor datumvalidatie gebruikt Amsterdam", () => {
  assert.equal(todayInAmsterdam(new Date("2026-11-15T23:30:00Z")), "2026-11-16");
});

test("voorbereidingstijd volgt Amsterdam-kalenderdagen, ook bij zomertijd en jaarwisseling", () => {
  assert.equal(earliestCateringDate(new Date("2026-11-15T23:30:00Z")), "2026-11-18");
  assert.equal(earliestCateringDate(new Date("2026-03-28T12:00:00Z")), "2026-03-30");
  assert.equal(earliestCateringDate(new Date("2026-10-24T12:00:00Z")), "2026-10-26");
  assert.equal(earliestCateringDate(new Date("2026-12-31T23:30:00Z")), "2027-01-03");
  const schema = createRequestSchema(() => new Date("2026-11-15T23:30:00Z"));
  for (const date of ["2026-11-16", "2026-11-17"]) assert.equal(schema.safeParse({ ...quote, date }).success, false);
  assert.equal(schema.safeParse({ ...quote, date: "2026-11-18" }).success, true);
});

test("server weigert aanvragen te kort vooraf voordat e-mail wordt verstuurd", async () => {
  let sent = 0;
  const response = await handler({ submit: async () => { sent++; return { reference, confirmationSent: true }; } })(makeRequest({ ...quote, date: "2026-11-16" }));
  assert.equal(response.status, 422);
  assert.ok((await response.json()).fieldErrors.date);
  assert.equal(sent, 0);
});

test("ongeldig e-mailadres, ontbrekende privacytoestemming en onbekende velden worden afgewezen", () => {
  assert.equal(requestSchema.safeParse({ ...quote, email: "geen-email" }).success, false);
  assert.equal(requestSchema.safeParse({ ...quote, privacy: false }).success, false);
  assert.equal(requestSchema.safeParse({ ...quote, unexpectedField: "not allowed" }).success, false);
});

test("server stuurt nooit e-mail bij ongeldige invoer", async () => {
  let sent = 0;
  const response = await handler({ submit: async () => { sent += 1; return { reference, confirmationSent: true }; } })(makeRequest({ ...quote, people: 0 }));
  assert.equal(response.status, 422);
  assert.equal(sent, 0);
  const result = await response.json();
  assert.ok(result.fieldErrors.people);
});

test("server verwerkt offerte zonder selectie en retourneert uniek aanvraagnummer", async () => {
  const response = await handler()(makeRequest(quote));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, reference, confirmationSent: true });
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("ongepubliceerde of ongeldige menuselectie wordt voor e-mail geweigerd", async () => {
  let sent = 0;
  const response = await handler({ resolveMenu: () => { throw new Error("unpublished"); }, submit: async () => { sent += 1; return { reference, confirmationSent: true }; } })(makeRequest({ ...quote, dishIds: ["unpublished-dish"] }));
  assert.equal(response.status, 422);
  assert.equal((await response.json()).code, "selection");
  assert.equal(sent, 0);
});

test("honeypot en te snelle inzending leiden niet tot e-mail", async () => {
  let sent = 0;
  const handle = handler({ submit: async () => { sent += 1; return { reference, confirmationSent: true }; } });
  assert.equal((await handle(makeRequest({ ...quote, website: "spam" }))).status, 400);
  assert.equal((await handle(makeRequest({ ...quote, startedAt: now }))).status, 400);
  assert.equal(sent, 0);
});

test("herkomstcontrole accepteert alleen expliciet bekende origins", () => {
  const config = { production: true, origins: [origin] };
  assert.equal(checkOrigin(makeRequest(quote), config), "catering.indiasekeuken.nl");
  assert.throws(() => checkOrigin(makeRequest(quote, { origin: "https://evil.example" }), config), RequestBoundaryError);
  assert.throws(() => checkOrigin(makeRequest(quote, { "sec-fetch-site": "cross-site" }), config), RequestBoundaryError);
});

test("32 KiB grens wordt ook zonder Content-Length op de stream toegepast", async () => {
  const request = new Request(`${origin}/api/aanvragen`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ data: "x".repeat(MAX_REQUEST_BYTES) }) });
  await assert.rejects(readBoundedJson(request), (error: unknown) => error instanceof RequestBoundaryError && error.status === 413);
});

test("niet-JSON en ongeldige JSON worden afgevangen", async () => {
  await assert.rejects(readBoundedJson(new Request(`${origin}/api`, { method: "POST", body: "hello" })), (error: unknown) => error instanceof RequestBoundaryError && error.status === 415);
  await assert.rejects(readBoundedJson(new Request(`${origin}/api`, { method: "POST", headers: { "content-type": "application/json" }, body: "{" })), (error: unknown) => error instanceof RequestBoundaryError && error.status === 400);
});

test("per-instance rate limiter begrenst pogingen en herstelt na venster", () => {
  let clock = now;
  const limit = createRateLimiter(() => clock);
  for (let count = 0; count < 5; count += 1) assert.equal(limit("test-address"), true);
  assert.equal(limit("test-address"), false);
  assert.equal(limit("different-address"), true);
  clock += 600001;
  assert.equal(limit("test-address"), true);
});

test("Turnstile configuratie faalt gesloten in productie of bij ontbrekende helft", () => {
  assert.throws(() => checkSecurityConfiguration({ production: true, origins: [] }), RequestBoundaryError);
  assert.throws(() => checkSecurityConfiguration({ production: false, origins: [], turnstileSiteKey: "public" }), RequestBoundaryError);
  assert.throws(() => checkSecurityConfiguration({ production: false, origins: [], turnstileSecret: "private" }), RequestBoundaryError);
  assert.doesNotThrow(() => checkSecurityConfiguration({ production: true, origins: [], allowUnprotectedForms: true }));
});

test("Turnstile controleert server-side succes, hostname én action", async () => {
  const config = { production: true, origins: [origin], turnstileSiteKey: "public", turnstileSecret: "private" };
  const fakeFetch = (payload: unknown) => (async () => Response.json(payload)) as typeof fetch;
  assert.equal(await verifyTurnstile("token", "catering.indiasekeuken.nl", config, fakeFetch({ success: true, hostname: "catering.indiasekeuken.nl", action: "catering_request" })), true);
  assert.equal(await verifyTurnstile("token", "catering.indiasekeuken.nl", config, fakeFetch({ success: true, hostname: "evil.example", action: "catering_request" })), false);
  assert.equal(await verifyTurnstile("token", "catering.indiasekeuken.nl", config, fakeFetch({ success: true, hostname: "catering.indiasekeuken.nl", action: "other" })), false);
  assert.equal(await verifyTurnstile("", "catering.indiasekeuken.nl", config, fakeFetch({ success: true })), false);
});

test("ontbrekende mailconfiguratie geeft een eerlijke foutmelding", async () => {
  const response = await handler({ isMailConfigured: () => false })(makeRequest(quote));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).ok, false);
});

test("mislukte interne e-mail geeft geen succesvolle formulierrespons", async () => {
  const response = await handler({ submit: async () => { throw new SubmissionError("delivery_failed"); } })(makeRequest(quote));
  assert.equal(response.status, 502);
  assert.equal((await response.json()).ok, false);
});

test("interne e-mail gaat eerst; ontvangstbevestiging daarna; canonical menunamen in beide", async () => {
  const sent: { message: MailMessage; key: string }[] = [];
  const service = createSubmissionService({ from: "sender@example.com", to: "internal@example.com", transport: { async send(message, key) { sent.push({ message, key }); return { accepted: true }; } } });
  const data = requestSchema.parse({ ...quote, dishIds: ["dish-one"] });
  const result = await service(data, { dishNames: ["Geverifieerd gerecht"] });
  assert.equal(result.reference, reference);
  assert.equal(result.confirmationSent, true);
  assert.equal(sent.length, 2);
  assert.equal(sent[0].message.to, "internal@example.com");
  assert.equal(sent[0].message.replyTo, quote.email);
  assert.equal(sent[1].message.to, quote.email);
  assert.match(sent[0].key, /\/internal$/);
  assert.match(sent[1].key, /\/confirmation$/);
  for (const item of sent) {
    assert.match(item.message.text, /Geverifieerd gerecht/);
    assert.match(item.message.html, /Geverifieerd gerecht/);
  }
  assert.match(sent[1].message.text, /geen definitieve bestelling/);
});

test("interne weigering voorkomt klantbevestiging", async () => {
  let count = 0;
  const service = createSubmissionService({ from: "sender@example.com", to: "internal@example.com", transport: { async send() { count += 1; return { accepted: false }; } } });
  await assert.rejects(service(requestSchema.parse(quote), emptyMenu), SubmissionError);
  assert.equal(count, 1);
});

test("alleen klantbevestiging mislukt: aanvraag blijft succesvol ontvangen", async () => {
  let count = 0;
  const service = createSubmissionService({ from: "sender@example.com", to: "internal@example.com", transport: { async send() { count += 1; if (count === 2) throw new Error("network"); return { accepted: true }; } } });
  assert.deepEqual(await service(requestSchema.parse(quote), emptyMenu), { reference, confirmationSent: false });
});

test("dubbele gelijktijdige klik en latere identieke retry sturen één e-mailpaar", async () => {
  let count = 0;
  const service = createSubmissionService({ from: "sender@example.com", to: "internal@example.com", transport: { async send() { count += 1; await Promise.resolve(); return { accepted: true }; } } });
  const data = requestSchema.parse(quote);
  const results = await Promise.all([service(data, emptyMenu), service(data, emptyMenu)]);
  assert.deepEqual(results[0], results[1]);
  await service({ ...data, turnstileToken: "renewed-token" }, emptyMenu);
  assert.equal(count, 2);
});

test("hergebruik van aanvraagnummer met gewijzigde inhoud wordt geweigerd", async () => {
  const service = createSubmissionService({ from: "sender@example.com", to: "internal@example.com", transport: { async send() { return { accepted: true }; } } });
  const data = requestSchema.parse(quote);
  await service(data, emptyMenu);
  await assert.rejects(service({ ...data, name: "Andere naam" }, emptyMenu), (error: unknown) => error instanceof SubmissionError && error.code === "request_conflict");
});

test("retry na onzekere interne verzending hergebruikt exact dezelfde idempotency key en e-mail", async () => {
  const calls: { message: MailMessage; key: string }[] = [];
  const service = createSubmissionService({ from: "sender@example.com", to: "internal@example.com", transport: { async send(message, key) {
    calls.push({ message, key });
    if (calls.length === 1) throw new Error("response lost after provider may have accepted email");
    return { accepted: true };
  } } });
  const data = requestSchema.parse(quote);
  await assert.rejects(service(data, emptyMenu), SubmissionError);
  const receipt = await service({ ...data, turnstileToken: "new-token" }, emptyMenu);
  assert.equal(receipt.confirmationSent, true);
  assert.equal(calls.length, 3);
  assert.deepEqual(calls[0], calls[1]);
  assert.match(calls[2].key, /\/confirmation$/);
});

test("verschillende serverinstances leveren identieke providerkeys en inhoud voor dezelfde retry", async () => {
  const calls: { message: MailMessage; key: string }[] = [];
  const options = { from: "sender@example.com", to: "internal@example.com", transport: { async send(message: MailMessage, key: string) { calls.push({ message, key }); return { accepted: true }; } } };
  const firstInstance = createSubmissionService(options);
  const secondInstance = createSubmissionService(options);
  const data = requestSchema.parse(quote);
  await firstInstance(data, emptyMenu);
  await secondInstance({ ...data, startedAt: data.startedAt + 10, turnstileToken: "renewed" }, emptyMenu);
  assert.deepEqual(calls[0], calls[2]);
  assert.deepEqual(calls[1], calls[3]);
});

test("rate limit retourneert Retry-After en bereikt e-mailtransport niet", async () => {
  let sent = 0;
  const response = await handler({ rateLimit: () => false, submit: async () => { sent += 1; return { reference, confirmationSent: true }; } })(makeRequest(quote));
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "600");
  assert.equal(sent, 0);
});

test("gebruikersinhoud wordt in HTML ge-escaped, platte tekst blijft leesbaar", () => {
  const data = requestSchema.parse({ ...contact, message: '<script>alert("x")</script> & details' });
  const emails = buildRequestEmails(data, emptyMenu, reference);
  assert.doesNotMatch(emails.internal.html, /<script>/);
  assert.match(emails.internal.html, /&lt;script&gt;/);
  assert.match(emails.internal.html, /&amp; details/);
  assert.match(emails.internal.text, /<script>/);
});

test("particuliere en zakelijke aanvragen worden verwerkt en herkenbaar in de e-mail opgenomen", async () => {
  for (const audience of ["private", "business"] as const) {
    for (const request of [{ ...quote, audience }, { ...contact, audience }]) {
      const parsed = requestSchema.parse(request);
      assert.equal((await handler()(makeRequest(request))).status, 200);
      const emails = buildRequestEmails(parsed, emptyMenu, reference);
      const label = audience === "private" ? /Particulier/ : /Zakelijk/;
      assert.match(emails.internal.subject, label);
      assert.match(emails.internal.text, label);
      assert.match(emails.confirmation.text, label);
    }
  }
});

test("contact heeft vier verplichte invoervelden, geen privacycheckbox of onjuiste toestemmingsclaim", () => {
  assert.equal(requestSchema.safeParse(contact).success, true);
  for (const field of ["name", "email", "phone", "message"]) assert.equal(requestSchema.safeParse({ ...contact, [field]: "" }).success, false);
  const emails = buildRequestEmails(requestSchema.parse(contact), emptyMenu, reference);
  assert.doesNotMatch(emails.internal.text, /Privacyverklaring: Akkoord/);
  assert.doesNotMatch(emails.confirmation.text, /Privacyverklaring: Akkoord/);
  assert.equal(requestSchema.safeParse({ ...contact, privacy: true }).success, false);
});

test("offerte, particulier contact en zakelijk contact krijgen passende aparte bevestigingen", () => {
  const quoteEmail = buildRequestEmails(requestSchema.parse(quote), { dishNames: ["Naan"] }, reference).confirmation;
  const privateEmail = buildRequestEmails(requestSchema.parse(contact), emptyMenu, reference).confirmation;
  const businessEmail = buildRequestEmails(requestSchema.parse({ ...contact, audience: "business" }), emptyMenu, reference).confirmation;
  assert.equal(new Set([quoteEmail.subject, privateEmail.subject, businessEmail.subject]).size, 3);
  assert.match(quoteEmail.text, /offerteaanvraag/);
  assert.match(quoteEmail.text, /geen definitieve bestelling/);
  assert.match(quoteEmail.text, /Naan/);
  assert.match(privateEmail.text, /Bedankt voor je bericht/);
  assert.match(businessEmail.text, /zakelijke catering/);
  for (const email of [privateEmail, businessEmail]) {
    assert.match(email.text, /Een testbericht/);
    assert.doesNotMatch(email.text, /Geselecteerde gerechten|geen definitieve bestelling|Kennisgenomen van het privacybeleid/);
  }
});

test("oude kennismakings- en samenwerkingsvarianten en een ontbrekend aanvraagtype worden geweigerd", () => {
  assert.equal(requestSchema.safeParse({ ...contact, kind: "meeting" }).success, false);
  assert.equal(requestSchema.safeParse({ ...contact, kind: "partnership" }).success, false);
  assert.equal(requestSchema.safeParse({ ...contact, audience: undefined }).success, false);
});
