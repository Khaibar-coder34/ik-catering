import { expect, test, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import site from "../../src/data/site.json";
import { content, formsContent as formCopy } from "../../src/lib/content";
import menuCopy from "../../src/data/menu-content.json";
import publishedDishes from "../../src/data/dishes.json";
import demoDishes from "../../src/data/demo/dishes.json";
import publishedCategories from "../../src/data/categories.json";
import demoCategories from "../../src/data/demo/categories.json";
import labelCopy from "../../src/data/dish-labels.json";
import { parseCatalog, type Dish } from "../../src/lib/catalog-schema";
import { getDishLabels } from "../../src/lib/dish-labels";
import { cateringSettings, earliestCateringDate, todayInAmsterdam } from "../../src/lib/catering-settings";

const paths = ["/", "/menu", "/over-ons", "/b2b", "/offerte", "/privacy"];
const reference = "IK-E2E-VOORBEELD";
const useDemoCatalog = process.env.E2E_CATALOG_DEMO !== "false";
const expectedCatalog = parseCatalog({ categories: useDemoCatalog ? demoCategories : publishedCategories, dishes: useDemoCatalog ? demoDishes : publishedDishes, arrangements: [] }, useDemoCatalog);
const categories = expectedCatalog.categories.map((category) => category.name);
const expectedDishes = expectedCatalog.dishes;
const [firstChoice, secondChoice] = expectedDishes;
const futureDate = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

function dishChoice(page: Page, dish: Pick<Dish, "id">) {
  return page.locator(`input[name="dishIds"][value="${dish.id}"]`);
}

function formFor(page: Page, prefix: "quote" | "contact-private" | "contact-business"): Locator {
  return page.locator("form").filter({ has: page.locator(`#${prefix}-name`) });
}

async function fillContactFields(form: Locator) {
  await form.getByLabel(formCopy.fields.name).fill("Testpersoon");
  await form.getByLabel(formCopy.fields.email).fill("test@example.com");
  await form.getByLabel(formCopy.fields.phone).fill("+31 30 123 4567");
}

async function nextStep(page: Page) {
  await page.getByRole("button", { name: formCopy.next, exact: true }).click();
  await expect(page.getByRole("heading", { name: formCopy.detailsStep, exact: true })).toBeVisible();
  return formFor(page, "quote");
}

async function fillQuote(page: Page, options: { people?: string; tableware?: "yes" | "no" | null; date?: string } = {}) {
  const form = formFor(page, "quote");
  await fillContactFields(form);
  if (options.people !== "") await form.getByLabel(formCopy.fields.people).fill(options.people ?? "24");
  await form.getByLabel(formCopy.fields.city).fill("Utrecht");
  await form.getByLabel(formCopy.fields.date).fill(options.date ?? futureDate());
  if (options.tableware !== null) await form.getByRole("radio", { name: options.tableware === "no" ? "Nee" : "Ja", exact: true }).check();
  await form.locator('input[name="privacy"]').check();
  return form;
}

async function acceptRequests(page: Page, captured: Record<string, unknown>[], options: { confirmationSent?: boolean; delay?: number } = {}) {
  await page.route("**/api/aanvragen", async (route) => {
    captured.push(route.request().postDataJSON() as Record<string, unknown>);
    if (options.delay) await new Promise((resolve) => setTimeout(resolve, options.delay));
    await route.fulfill({ status: 200, json: { ok: true, reference, confirmationSent: options.confirmationSent ?? true } });
  });
}

async function checkAccessibility(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    // The development indicator belongs to Next.js tooling, not the delivered website.
    .exclude("nextjs-portal")
    .analyze();
  expect(result.violations).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  // No browser test sends real mail. Each test controls the API response explicitly.
  await page.route("**/api/aanvragen", (route) => route.fulfill({ status: 503, json: { ok: false, message: formCopy.apiErrors.configuration } }));
});

for (const path of paths) {
  test(`pagina ${path} laadt met een hoofdkop en eigen canonical`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page).toHaveTitle(/Indiase Keuken/);
    // Next normalizes an origin-only canonical by dropping its trailing slash.
    await expect.poll(async () => new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!).href).toBe(`http://localhost:3100${path}`);
    await expect(page.locator("html")).toHaveAttribute("lang", "nl");
    expect(errors).toEqual([]);
  });
}

test("hoofdnavigatie bevat vier pagina's en werkt", async ({ page }, testInfo) => {
  await page.goto("/");
  const logo = page.locator("header .brand-logo");
  await expect.poll(() => logo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(page.locator("header .brand")).toHaveAccessibleName(site.ui.homeLabel);
  await page.screenshot({ path: testInfo.outputPath("home-desktop.png") });
  const navigation = page.locator(".desktop-nav");
  await expect(navigation.getByRole("link")).toHaveText(["Home", "Menu", "Over ons", "B2B"]);
  const hrefs = await page.locator('header a[href^="/"], footer a[href^="/"]').evaluateAll((links) => [...new Set(links.map((link) => link.getAttribute("href")!.split("#")[0]))]);
  for (const href of hrefs) expect(paths).toContain(href);
  await navigation.getByRole("link", { name: "Menu", exact: true }).click();
  await expect(page).toHaveURL(/\/menu$/);
  await navigation.getByRole("link", { name: "B2B", exact: true }).click();
  await expect(page).toHaveURL(/\/b2b$/);
  await expect(formFor(page, "contact-business")).toBeVisible();
});

for (const [from, to] of [["/menukaart", "/menu"], ["/arrangementen", "/menu"], ["/onze-catering", "/"], ["/samenwerken", "/b2b"], ["/contact", "/over-ons#contact"]]) {
  test(`oude route ${from} verwijst naar ${to}`, async ({ page }) => {
    await page.goto(from);
    await expect(page).toHaveURL(`http://localhost:3100${to}`);
  });
}

test("B2B toont de bevestigde contactgegevens", async ({ page }) => {
  await page.goto("/b2b");
  const contact = page.locator("main .contact-details");
  await expect(contact.getByText(`${site.address}, ${site.postalCode ? `${site.postalCode} ` : ""}${site.city}`, { exact: true })).toBeVisible();
  await expect(contact.getByRole("link", { name: site.phone })).toHaveAttribute("href", `tel:${site.phone}`);
  await expect(contact.getByRole("link", { name: site.email })).toHaveAttribute("href", `mailto:${site.email}`);
  await expect(contact.getByRole("link", { name: content.contact.whatsappLabel })).toHaveAttribute("href", "https://wa.me/31624845749");
  await expect(contact.getByText(content.contact.visitNote, { exact: true })).toBeVisible();
});

test("het menu toont de ingestelde categorieën, toelichtingen en gerechtkaarten", async ({ page }, testInfo) => {
  await page.goto("/menu");
  await expect(page.locator(".menu-category h2")).toHaveText(categories);
  const categoryNavigation = page.getByRole("navigation", { name: "Gerechtcategorieën" });
  await expect(categoryNavigation.getByRole("link")).toHaveText(categories);
  const lastCategory = expectedCatalog.categories.at(-1)!;
  await categoryNavigation.getByRole("link", { name: lastCategory.name, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`#menu-${lastCategory.id}$`));
  await expect(page.locator(`#menu-${lastCategory.id}`)).toBeInViewport();
  for (const category of expectedCatalog.categories) {
    const section = page.getByRole("region", { name: category.name, exact: true });
    if (category.description) await expect(section.locator(".menu-category-description")).toHaveText(category.description);
    else await expect(section.locator(".menu-category-description")).toHaveCount(0);
  }
  await expect(page.getByRole("searchbox")).toHaveCount(0);
  await expect(page.locator(".menu-browser input, .menu-browser button")).toHaveCount(0);
  await expect(page.getByText("Ongepubliceerd voorbeeld", { exact: true })).toHaveCount(0);
  const cards = page.locator(".product-card");
  await expect(cards).toHaveCount(expectedDishes.length);
  for (const card of await cards.all()) {
    await expect(card.locator(":scope > *")).toHaveCount(3);
    await expect(card.getByRole("heading", { level: 3 })).toBeVisible();
    await expect(card.locator(".product-description p")).toBeVisible();
    await expect(card.locator("button, input, a")).toHaveCount(0);
    const headingId = await card.getAttribute("aria-labelledby");
    const dish = expectedDishes.find((dish) => `product-${dish.id}` === headingId)!;
    await expect(card.getByRole("heading", { level: 3 })).toHaveText(dish.name);
    await expect(card.locator(".product-description p")).toHaveText(dish.description);
    await expect(card.locator(".dish-label").first()).toHaveText(labelCopy.types[dish.type as keyof typeof labelCopy.types]);
    if (dish.image) {
      await card.scrollIntoViewIfNeeded();
      await expect(card.locator(".product-photo img")).toBeVisible();
      await expect.poll(() => card.locator(".product-photo img").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      await expect(card.locator(".image-fallback")).toHaveCount(0);
    }
  }
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const card of await cards.all()) {
      const geometry = await card.evaluate((element) => {
        const sections = Array.from(element.children);
        const heights = sections.map((section) => section.getBoundingClientRect().height);
        const total = heights.reduce((sum, height) => sum + height, 0);
        const unclipped = sections.every((section) => {
          const bounds = section.getBoundingClientRect();
          return section.scrollHeight <= section.clientHeight + 1
            && section.scrollWidth <= section.clientWidth + 1
            && Array.from(section.querySelectorAll("*")).every((descendant) => {
              const rect = descendant.getBoundingClientRect();
              return rect.top >= bounds.top - 1 && rect.bottom <= bounds.bottom + 1
                && rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1;
            });
        });
        return { name: element.getAttribute("aria-labelledby"), ratios: heights.map((height) => height / total), unclipped };
      });
      const context = `${geometry.name} bij ${width}px`;
      expect(geometry.ratios[0], context).toBeCloseTo(0.6, 2);
      expect(geometry.ratios[1], context).toBeCloseTo(0.2, 2);
      expect(geometry.ratios[2], context).toBeCloseTo(0.2, 2);
      expect(geometry.unclipped, context).toBe(true);
    }
    if (width === 320) {
      const longestName = expectedDishes.reduce((longest, dish) => dish.name.length > longest.name.length ? dish : longest);
      await page.locator(`article[aria-labelledby="product-${longestName.id}"]`).screenshot({ path: testInfo.outputPath("long-name-mobile.png") });
    }
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath("menu-desktop.png") });
  if (expectedCatalog.categories.some((category) => category.id === "biryanigerechten")) {
    await page.locator("#menu-biryanigerechten").evaluate((heading) => heading.scrollIntoView({ block: "start" }));
    await page.screenshot({ path: testInfo.outputPath("biryani-desktop.png") });
  }
});

test("offerte begint met compacte selectie en kan zonder gerechten verder", async ({ page }) => {
  await page.goto("/offerte");
  await page.locator(".quote-conditions summary").click();
  await expect(page.locator(".quote-conditions")).toContainText("de helft van de betaalde aanbetaling");
  await page.locator(".quote-conditions summary").click();
  await expect(page.getByRole("heading", { name: formCopy.menuStep, exact: true })).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await expect(page.locator(".compact-category legend")).toHaveText(categories);
  await expect(page.locator(".compact-dish")).toHaveCount(expectedDishes.length);
  await expect(page.locator(".compact-dish p, .compact-dish .product-description")).toHaveCount(0);
  const labeledDish = expectedDishes.find((dish) => dish.type === "vegan") ?? firstChoice;
  const labeledChoice = dishChoice(page, labeledDish);
  await expect(labeledChoice).toHaveAccessibleName(labeledDish.name);
  await expect(labeledChoice).toHaveAccessibleDescription(getDishLabels(labeledDish).map((label) => label.text).join(" "));
  await expect(page.locator(".compact-dish").filter({ has: labeledChoice }).locator(".dish-label").first()).toHaveText(labelCopy.types[labeledDish.type]);
  const form = await nextStep(page);
  await expect(form.getByLabel(formCopy.fields.people)).toHaveAttribute("min", String(cateringSettings.minPeople));
  await expect(form.getByLabel(formCopy.fields.people)).not.toHaveAttribute("max");
  await expect(form.getByLabel(formCopy.fields.date)).toHaveAttribute("min", earliestCateringDate());
  await expect(form.getByRole("radio", { name: formCopy.audiences.private, exact: true })).toBeChecked();
  await expect(form.getByRole("radio", { name: formCopy.audiences.business, exact: true })).not.toBeChecked();
  await expect(page.getByText(formCopy.emptySummary, { exact: true }).last()).toBeVisible();
});

test("gerechtselectie blijft behouden bij navigatie en herladen en kan verwijderd worden", async ({ page }) => {
  await page.goto("/offerte");
  await dishChoice(page, firstChoice).check();
  await dishChoice(page, secondChoice).check();
  await dishChoice(page, secondChoice).uncheck();
  await page.locator(".desktop-nav").getByRole("link", { name: "Menu", exact: true }).click();
  await page.locator(".header-cta").click();
  await expect(dishChoice(page, firstChoice)).toBeChecked();
  await page.reload();
  await expect(dishChoice(page, firstChoice)).toBeChecked();
  await expect(dishChoice(page, secondChoice)).not.toBeChecked();
  await dishChoice(page, firstChoice).uncheck();
  await expect(page.locator(".selection-total")).toHaveText(`0 ${menuCopy.selectedPlural}`);
});

test("oude arrangementopslag beïnvloedt de nieuwe offerte niet", async ({ page }) => {
  await page.addInitScript(({ key, ids }) => sessionStorage.setItem(key, JSON.stringify({ version: 1, selection: { dishIds: [ids[0]], arrangementId: "klassiek-buffet", arrangementDishIds: ids } })), { key: `ik-catering-selection:v1:${useDemoCatalog ? "demo" : "published"}`, ids: [firstChoice.id, secondChoice.id] });
  await page.goto("/offerte");
  await expect(dishChoice(page, firstChoice)).not.toBeChecked();
  await expect(dishChoice(page, secondChoice)).not.toBeChecked();
});

test("Terug bewaart ingevulde gegevens, radiokeuzes en privacyakkoord", async ({ page }) => {
  await page.goto("/offerte");
  await nextStep(page);
  const date = futureDate();
  const form = await fillQuote(page, { date });
  await form.getByRole("radio", { name: formCopy.audiences.business, exact: true }).check();
  await form.getByRole("button", { name: formCopy.back, exact: true }).click();
  await expect(page.getByRole("heading", { name: formCopy.menuStep, exact: true })).toBeFocused();
  await dishChoice(page, secondChoice).check();
  await nextStep(page);
  await expect(form.getByLabel(formCopy.fields.name)).toHaveValue("Testpersoon");
  await expect(form.getByLabel(formCopy.fields.email)).toHaveValue("test@example.com");
  await expect(form.getByLabel(formCopy.fields.date)).toHaveValue(date);
  await expect(form.getByLabel(formCopy.fields.people)).toHaveValue("24");
  await expect(form.getByRole("radio", { name: formCopy.audiences.business, exact: true })).toBeChecked();
  await expect(form.getByRole("radio", { name: "Ja", exact: true })).toBeChecked();
  await expect(form.locator('input[name="privacy"]')).toBeChecked();
});

test("aantal personen, datum en servieskeuze zijn verplicht", async ({ page }) => {
  let requests = 0;
  await page.route("**/api/aanvragen", async (route) => { requests++; await route.fulfill({ status: 500, json: { ok: false } }); });
  await page.goto("/offerte");
  await nextStep(page);
  const form = await fillQuote(page, { people: "", tableware: null, date: "" });
  await form.getByRole("button", { name: formCopy.submit, exact: true }).click();
  await expect(form.getByLabel(formCopy.fields.people)).toHaveAttribute("aria-invalid", "true");
  await expect(form.getByLabel(formCopy.fields.date)).toHaveAttribute("aria-invalid", "true");
  await expect(form.getByText(formCopy.validation.tableware, { exact: true })).toBeVisible();
  expect(requests).toBe(0);
  await expect(form.locator('input[name*="budget" i], select[name*="budget" i], textarea[name*="budget" i]')).toHaveCount(0);
  const names = await form.locator('input:not([type="radio"]):not([type="checkbox"])').evaluateAll((inputs) => inputs.map((input) => input.getAttribute("name")).filter((name) => name !== "website"));
  expect(names).toEqual(["name", "email", "phone", "city", "people", "date"]);
  await form.getByLabel(formCopy.fields.people).fill(String(cateringSettings.minPeople - 1));
  await form.getByLabel(formCopy.fields.date).fill(todayInAmsterdam());
  await form.getByRole("radio", { name: "Nee", exact: true }).check();
  await form.getByRole("button", { name: formCopy.submit, exact: true }).click();
  await expect(form.getByText(formCopy.validation.minimumPeople.replace("{minPeople}", String(cateringSettings.minPeople)), { exact: true })).toBeVisible();
  await expect(form.getByText(formCopy.validation.leadDays.replace("{leadDays}", String(cateringSettings.leadDays)), { exact: true })).toBeVisible();
  expect(requests).toBe(0);
});

for (const scenario of [{ audience: "private", dishes: [] }, { audience: "business", dishes: [firstChoice, secondChoice] }] as const) {
  test(`offerte voor ${scenario.audience} ${scenario.dishes.length ? "met" : "zonder"} gerechten verstuurt`, async ({ page }) => {
    const sent: Record<string, unknown>[] = [];
    await acceptRequests(page, sent);
    await page.goto("/offerte");
    for (const dish of scenario.dishes) await dishChoice(page, dish).check();
    await nextStep(page);
    const form = await fillQuote(page);
    await form.getByRole("radio", { name: formCopy.audiences[scenario.audience], exact: true }).check();
    await form.getByRole("button", { name: formCopy.submit, exact: true }).click();
    await expect(page.getByRole("heading", { name: formCopy.successTitle })).toBeVisible();
    await expect(page.getByText(formCopy.successQuote, { exact: true })).toBeVisible();
    await expect(page.getByText(formCopy.confirmationSent, { exact: true })).toBeVisible();
    await expect(page.getByText(reference, { exact: true })).toBeVisible();
    expect(sent).toHaveLength(1);
    expect(sent[0].dishIds).toEqual(scenario.dishes.map((dish) => dish.id));
    expect(sent[0]).toMatchObject({ kind: "quote", audience: scenario.audience, people: 24, tableware: "yes", privacy: true });
    expect(sent[0]).not.toHaveProperty("arrangementId");
  });
}

test("een dubbele klik veroorzaakt maar één verzoek", async ({ page }) => {
  const sent: Record<string, unknown>[] = [];
  await acceptRequests(page, sent, { delay: 400 });
  await page.goto("/offerte");
  await nextStep(page);
  const form = await fillQuote(page);
  await form.getByRole("button", { name: formCopy.submit, exact: true }).dblclick();
  await expect(page.getByRole("heading", { name: formCopy.successTitle })).toBeVisible();
  expect(sent).toHaveLength(1);
});

test("e-mailfout behoudt invoer en herhalen gebruikt hetzelfde aanvraag-ID", async ({ page }) => {
  const sent: Record<string, unknown>[] = [];
  await page.route("**/api/aanvragen", async (route) => {
    sent.push(route.request().postDataJSON() as Record<string, unknown>);
    await route.fulfill(sent.length === 1 ? { status: 502, json: { ok: false, message: formCopy.apiErrors.retry } } : { status: 200, json: { ok: true, reference, confirmationSent: true } });
  });
  await page.goto("/offerte");
  await nextStep(page);
  const form = await fillQuote(page);
  await form.getByRole("button", { name: formCopy.submit, exact: true }).click();
  await expect(form.getByRole("alert")).toHaveText(formCopy.apiErrors.retry);
  await expect(form.getByLabel(formCopy.fields.email)).toHaveValue("test@example.com");
  await expect(page.getByRole("heading", { name: formCopy.successTitle })).toHaveCount(0);
  await form.getByRole("button", { name: formCopy.submit, exact: true }).click();
  await expect(page.getByRole("heading", { name: formCopy.successTitle })).toBeVisible();
  expect(sent).toHaveLength(2);
  expect(sent[1].requestId).toBe(sent[0].requestId);
});

test("mislukte klantbevestiging verliest de ontvangen aanvraag niet", async ({ page }) => {
  const sent: Record<string, unknown>[] = [];
  await acceptRequests(page, sent, { confirmationSent: false });
  await page.goto("/offerte");
  await nextStep(page);
  const form = await fillQuote(page);
  await form.getByRole("button", { name: formCopy.submit, exact: true }).click();
  await expect(page.getByText(formCopy.confirmationFailed, { exact: true })).toBeVisible();
  await expect(page.getByText(reference, { exact: true })).toBeVisible();
  expect(sent).toHaveLength(1);
});

for (const scenario of [{ path: "/over-ons", audience: "private", prefix: "contact-private" }, { path: "/b2b", audience: "business", prefix: "contact-business" }] as const) {
  test(`contactformulier ${scenario.audience} verstuurt het juiste type bericht`, async ({ page }) => {
    const sent: Record<string, unknown>[] = [];
    await acceptRequests(page, sent);
    await page.goto(scenario.path);
    const form = formFor(page, scenario.prefix);
    await fillContactFields(form);
    await form.getByLabel(formCopy.fields.message).fill("Wij bespreken graag de mogelijkheden voor onze bijeenkomst.");
    await expect(form.getByRole("radio")).toHaveCount(0);
    await expect(form.getByRole("checkbox")).toHaveCount(0);
    await form.getByRole("button", { name: formCopy.submit, exact: true }).click();
    await expect(page.getByRole("heading", { name: formCopy.successTitle })).toBeVisible();
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ kind: "contact", audience: scenario.audience, name: "Testpersoon", email: "test@example.com" });
    expect(sent[0]).not.toHaveProperty("company");
  });
}

test("mobiele navigatie werkt en pagina's passen op smalle schermen", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect.poll(() => page.locator("header .brand-logo").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("home-mobile.png") });
  await page.getByRole("button", { name: site.ui.menuOpen, exact: true }).click();
  await expect(page.getByRole("button", { name: site.ui.menuClose, exact: true })).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: site.ui.menuOpen, exact: true })).toBeFocused();
  await page.getByRole("button", { name: site.ui.menuOpen, exact: true }).click();
  await page.locator("#mobile-navigation").getByRole("link", { name: "Menu", exact: true }).click();
  await expect(page).toHaveURL(/\/menu$/);
  await expect(page.getByRole("button", { name: site.ui.menuOpen, exact: true })).toHaveAttribute("aria-expanded", "false");
  for (const width of [390, 320, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of paths) {
      await page.goto(path);
      if (path === "/offerte") await nextStep(page);
      const dimensions = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: window.innerWidth }));
      expect(dimensions.content, `${path} at ${width}px`).toBeLessThanOrEqual(dimensions.viewport + 1);
    }
  }
});

test("ontbrekende afbeeldingen houden een bruikbaar kader met alternatief", async ({ page }) => {
  await page.route("**/_next/image**", (route) => route.abort());
  await page.goto("/");
  const fallback = page.getByRole("img", { name: content.home.imageAlt, exact: true });
  await expect(fallback).toContainText(site.ui.imageFallback);
  await expect(fallback).toBeVisible();
  const bounds = await fallback.boundingBox();
  expect(bounds?.width).toBeGreaterThan(100);
  expect(bounds?.height).toBeGreaterThan(100);
});

test("onbekende route toont de 404 en kan terug naar home", async ({ page }) => {
  const response = await page.goto("/deze-pagina-bestaat-niet");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: site.ui.notFoundTitle })).toBeVisible();
  await page.getByRole("link", { name: site.ui.backHome, exact: true }).click();
  await expect(page).toHaveURL("http://localhost:3100/");
});

for (const path of ["/", "/menu", "/over-ons", "/b2b", "/offerte"]) {
  test(`toegankelijkheidscontrole ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    await checkAccessibility(page);
  });
}

test("toegankelijkheidscontrole mobiele offerte stap 2 met validatiefouten", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/offerte");
  const form = await nextStep(page);
  await form.getByRole("button", { name: formCopy.submit, exact: true }).click();
  await expect(form.getByRole("alert")).toBeVisible();
  await checkAccessibility(page);
});
