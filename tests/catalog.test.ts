import assert from "node:assert/strict";
import test from "node:test";
import categories from "../src/data/demo/categories.json";
import dishes from "../src/data/demo/dishes.json";
import arrangements from "../src/data/demo/arrangements.json";
import productionCategories from "../src/data/categories.json";
import productionDishes from "../src/data/dishes.json";
import productionArrangements from "../src/data/arrangements.json";
import { categorySchema, dishSchema, parseCatalog } from "../src/lib/catalog-schema";
import { getDishLabels } from "../src/lib/dish-labels";
import { isDemoCatalogEnabled } from "../src/lib/catalog";
import { EMPTY_SELECTION, SelectionError, removeSelectionDish, resolveSelection, restoreSelection, serializeSelection, toggleSelectionDish, validateSelection } from "../src/lib/selection";

const source = { categories, dishes, arrangements };
const catalog = () => parseCatalog(source, true);
const productionSource = { categories: productionCategories, dishes: productionDishes, arrangements: productionArrangements };
const publishedCatalog = () => parseCatalog(productionSource);

test("demo content is opt-in and never activates in production", () => {
  assert.equal(isDemoCatalogEnabled("production", "true"), false);
  assert.equal(isDemoCatalogEnabled("development", undefined), false);
  assert.equal(isDemoCatalogEnabled("development", "true"), true);
  assert.equal(isDemoCatalogEnabled("test", "false"), false);
  const live = publishedCatalog();
  assert.equal(live.isDemo, false);
  assert.deepEqual(live.categories.map((category) => category.name), productionCategories.filter((category) => category.isPublished).sort((a, b) => a.sortOrder - b.sortOrder).map((category) => category.name));
  assert.deepEqual(live.dishes.map((dish) => dish.id).sort(), productionDishes.filter((dish) => dish.isPublished && live.categories.some((category) => category.id === dish.categoryId)).map((dish) => dish.id).sort());
  assert.equal(live.arrangements.length, 0);
});

test("published catalog includes Biryani between mains and sides while demo remains independent", () => {
  const live = publishedCatalog();
  assert.deepEqual(live.categories.map((category) => category.id), ["hoofdgerechten", "biryanigerechten", "bijgerechten", "nagerechten"]);
  assert.equal(live.categories.find((category) => category.id === "biryanigerechten")?.name, "Biryani Gerechten");
  assert.ok(live.dishes.some((dish) => dish.categoryId === "biryanigerechten"));
  const data = catalog();
  assert.deepEqual(data.categories.map((category) => category.id), ["hoofdgerechten", "bijgerechten", "nagerechten"]);
  for (const category of data.categories) assert.ok(data.dishes.some((dish) => dish.categoryId === category.id));
  assert.ok(data.dishes.some((dish) => dish.categoryId === "nagerechten"));
  assert.ok(data.dishes.every((dish) => data.categories.some((category) => category.id === dish.categoryId)));
});

test("editor comments are valid JSON fields and never enter public catalog data", () => {
  const note = "Alleen voor de redacteur: wijzig hier de omschrijving.";
  const category = { ...categories[0], _comment: note };
  const dish = { ...dishes[0], _comment: note };
  assert.equal("_comment" in categorySchema.parse(category), false);
  assert.equal("_comment" in dishSchema.parse(dish), false);
  const result = parseCatalog({ ...source, categories: categories.map((item) => ({ ...item, _comment: note })), dishes: dishes.map((item) => ({ ...item, _comment: note })) });
  assert.equal(JSON.stringify(result).includes(note), false);
  assert.equal(category._comment, note);
  assert.equal(categorySchema.safeParse({ ...category, _comment: 123 }).success, false);
  assert.equal(dishSchema.safeParse({ ...dish, _comment: "x".repeat(2001) }).success, false);
});

test("publication removes draft dishes and dishes in draft categories", () => {
  assert.ok(!catalog().dishes.some((dish) => dish.id === "concept-gerecht"));
  const result = parseCatalog({ ...source, categories: categories.map((category) => ({ ...category, isPublished: category.id !== "bijgerechten" })) });
  assert.ok(!result.dishes.some((dish) => dish.categoryId === "bijgerechten"));
  assert.ok(result.dishes.some((dish) => dish.categoryId === "hoofdgerechten"));
});

test("dish labels remain optional and support fish and short custom characteristics", () => {
  const existing = dishSchema.parse(dishes[0]);
  assert.equal(existing.labels, undefined);
  const withLabels = dishSchema.parse({ ...dishes[0], type: "fish", labels: [" Pittig ", "Populair"] });
  assert.deepEqual(withLabels.labels, ["Pittig", "Populair"]);
  assert.deepEqual(getDishLabels(withLabels).map((label) => label.text), ["Visgerecht", "Pittig", "Populair"]);
  assert.deepEqual(getDishLabels({ type: "vegan", labels: ["Vegan", "Pittig", "pittig"] }).map((label) => label.text), ["Vegan", "Pittig"]);
});

test("dish label validation rejects empty, multiline, long or excessive labels", () => {
  for (const labels of [[""], ["   "], ["a\nb"], ["x".repeat(19)], ["A", "B", "C", "D"]]) {
    assert.equal(dishSchema.safeParse({ ...dishes[0], labels }).success, false);
  }
});

test("malformed repository data fails validation rather than producing broken cards", () => {
  assert.throws(() => parseCatalog({ ...source, dishes: [...dishes, dishes[0]] }), /dubbele id/);
  assert.throws(() => parseCatalog({ ...source, dishes: [{ ...dishes[0], categoryId: "missing" }] }), /categorie missing/);
  assert.throws(() => parseCatalog({ ...source, dishes: dishes.map((dish, index) => index ? dish : { ...dish, type: "halal" }) }));
  assert.throws(() => parseCatalog({ ...source, dishes: dishes.map((dish, index) => index ? dish : { ...dish, image: "https://untrusted.example/food.jpg" }) }));
});

for (const [name, getData] of [["demo", catalog], ["published", publishedCatalog]] as const) {
  test(`${name} choices toggle, remove and resolve without duplicate email dishes`, () => {
    const data = getData();
    const [first, second] = data.dishes;
    assert.ok(first && second, "De selectiecontrole heeft twee gepubliceerde voorbeeldgerechten nodig.");
    const selected = toggleSelectionDish(data, EMPTY_SELECTION, first.id);
    assert.deepEqual(selected.dishIds, [first.id]);
    assert.equal(resolveSelection(data, selected).dishes[0].name, first.name);
    assert.deepEqual(toggleSelectionDish(data, selected, first.id), EMPTY_SELECTION);
    assert.deepEqual(removeSelectionDish(data, selected, first.id), EMPTY_SELECTION);
    const deduplicated = validateSelection(data, { ...EMPTY_SELECTION, dishIds: [first.id, first.id, second.id] });
    assert.deepEqual(deduplicated.dishIds, [first.id, second.id]);
    assert.deepEqual(resolveSelection(data, deduplicated).dishes.map((dish) => dish.name), [first.name, second.name]);
  });
}

test("a quote may have no dishes, but unknown and unpublished IDs are rejected", () => {
  const data = catalog();
  assert.deepEqual(resolveSelection(data, EMPTY_SELECTION).dishIds, []);
  assert.throws(() => validateSelection(data, { ...EMPTY_SELECTION, dishIds: ["concept-gerecht"] }), SelectionError);
  assert.throws(() => validateSelection(data, { ...EMPTY_SELECTION, dishIds: ["forged-id"] }), SelectionError);
  assert.throws(() => validateSelection(data, { ...EMPTY_SELECTION, dishIds: Array.from({ length: 101 }, () => data.dishes[0].id) }), SelectionError);
});

test("v2 session storage roundtrip preserves individual preferences", () => {
  const data = catalog();
  const [first, second] = data.dishes;
  const selected = toggleSelectionDish(data, toggleSelectionDish(data, EMPTY_SELECTION, first.id), second.id);
  assert.deepEqual(JSON.parse(serializeSelection(selected)), { version: 2, dishIds: [first.id, second.id] });
  assert.deepEqual(restoreSelection(data, serializeSelection(selected)), selected);
  assert.deepEqual(restoreSelection(data, "malformed"), EMPTY_SELECTION);
  assert.deepEqual(restoreSelection(data, JSON.stringify({ version: 999, dishIds: [first.id] })), EMPTY_SELECTION);
  assert.deepEqual(restoreSelection(data, JSON.stringify({ version: 2, dishIds: [first.id, "deleted-dish", first.id, "concept-gerecht"] })).dishIds, [first.id]);
  assert.deepEqual(restoreSelection(parseCatalog({ categories: productionCategories, dishes: [], arrangements: [] }), serializeSelection(selected)), EMPTY_SELECTION);
});

test("legacy arrangement preferences cannot leak into the new quote flow", () => {
  const data = catalog();
  const first = data.dishes[0];
  const legacy = { dishIds: [first.id], arrangementId: "klassiek-buffet", arrangementDishIds: data.dishes.slice(0, 4).map((dish) => dish.id) };
  assert.deepEqual(restoreSelection(data, JSON.stringify({ version: 1, selection: legacy })), EMPTY_SELECTION);
  assert.deepEqual(restoreSelection(data, serializeSelection(legacy)), { dishIds: [first.id], arrangementId: null, arrangementDishIds: [] });
  assert.deepEqual(restoreSelection(data, JSON.stringify({ version: 2, dishIds: [first.id], arrangementId: "klassiek-buffet" })), EMPTY_SELECTION);
});
