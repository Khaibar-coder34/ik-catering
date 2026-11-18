import assert from "node:assert/strict";
import test from "node:test";
import categories from "../src/data/demo/categories.json";
import dishes from "../src/data/demo/dishes.json";
import arrangements from "../src/data/demo/arrangements.json";
import productionCategories from "../src/data/categories.json";
import productionDishes from "../src/data/dishes.json";
import productionArrangements from "../src/data/arrangements.json";
import { parseCatalog } from "../src/lib/catalog-schema";
import { isDemoCatalogEnabled } from "../src/lib/catalog";
import { EMPTY_SELECTION, SelectionError, removeSelectionDish, resolveSelection, restoreSelection, serializeSelection, toggleSelectionDish, validateSelection } from "../src/lib/selection";

const source = { categories, dishes, arrangements };
const catalog = () => parseCatalog(source, true);
const categoryNames = ["Hoofdgerechten", "Bijgerechten", "Nagerechten"];

test("demo content is opt-in and never activates in production", () => {
  assert.equal(isDemoCatalogEnabled("production", "true"), false);
  assert.equal(isDemoCatalogEnabled("development", undefined), false);
  assert.equal(isDemoCatalogEnabled("development", "true"), true);
  assert.equal(isDemoCatalogEnabled("test", "false"), false);
  const live = parseCatalog({ categories: productionCategories, dishes: productionDishes, arrangements: productionArrangements });
  assert.equal(live.isDemo, false);
  assert.deepEqual(live.categories.map((category) => category.name), categoryNames);
  assert.deepEqual(live.dishes.map((dish) => dish.id).sort(), productionDishes.filter((dish) => dish.isPublished).map((dish) => dish.id).sort());
  assert.equal(live.arrangements.length, 0);
});

test("both catalogs expose exactly the three agreed categories", () => {
  const data = catalog();
  assert.deepEqual(data.categories.map((category) => category.name), categoryNames);
  for (const category of data.categories) assert.ok(data.dishes.some((dish) => dish.categoryId === category.id));
  assert.ok(data.dishes.some((dish) => dish.categoryId === "nagerechten"));
  assert.ok(data.dishes.every((dish) => data.categories.some((category) => category.id === dish.categoryId)));
});

test("publication removes draft dishes and dishes in draft categories", () => {
  assert.ok(!catalog().dishes.some((dish) => dish.id === "concept-gerecht"));
  const result = parseCatalog({ ...source, categories: categories.map((category) => ({ ...category, isPublished: category.id !== "bijgerechten" })) });
  assert.ok(!result.dishes.some((dish) => dish.categoryId === "bijgerechten"));
  assert.ok(result.dishes.some((dish) => dish.categoryId === "hoofdgerechten"));
});

test("malformed repository data fails validation rather than producing broken cards", () => {
  assert.throws(() => parseCatalog({ ...source, dishes: [...dishes, dishes[0]] }), /dubbele id/);
  assert.throws(() => parseCatalog({ ...source, dishes: [{ ...dishes[0], categoryId: "missing" }] }), /categorie missing/);
  assert.throws(() => parseCatalog({ ...source, dishes: dishes.map((dish, index) => index ? dish : { ...dish, type: "halal" }) }));
  assert.throws(() => parseCatalog({ ...source, dishes: dishes.map((dish, index) => index ? dish : { ...dish, image: "https://untrusted.example/food.jpg" }) }));
});

test("individual choices toggle, remove and resolve without duplicate email dishes", () => {
  const data = catalog();
  const selected = toggleSelectionDish(data, EMPTY_SELECTION, "naan");
  assert.deepEqual(selected.dishIds, ["naan"]);
  assert.equal(resolveSelection(data, selected).dishes[0].name, "Naan");
  assert.deepEqual(toggleSelectionDish(data, selected, "naan"), EMPTY_SELECTION);
  assert.deepEqual(removeSelectionDish(data, selected, "naan"), EMPTY_SELECTION);
  const deduplicated = validateSelection(data, { ...EMPTY_SELECTION, dishIds: ["naan", "naan", "kheer"] });
  assert.deepEqual(deduplicated.dishIds, ["naan", "kheer"]);
  assert.deepEqual(resolveSelection(data, deduplicated).dishes.map((dish) => dish.name), ["Naan", "Kheer"]);
});

test("a quote may have no dishes, but unknown and unpublished IDs are rejected", () => {
  const data = catalog();
  assert.deepEqual(resolveSelection(data, EMPTY_SELECTION).dishIds, []);
  assert.throws(() => validateSelection(data, { ...EMPTY_SELECTION, dishIds: ["concept-gerecht"] }), SelectionError);
  assert.throws(() => validateSelection(data, { ...EMPTY_SELECTION, dishIds: ["forged-id"] }), SelectionError);
  assert.throws(() => validateSelection(data, { ...EMPTY_SELECTION, dishIds: Array.from({ length: 101 }, () => "naan") }), SelectionError);
});

test("v2 session storage roundtrip preserves individual preferences", () => {
  const data = catalog();
  const selected = toggleSelectionDish(data, toggleSelectionDish(data, EMPTY_SELECTION, "naan"), "kheer");
  assert.deepEqual(JSON.parse(serializeSelection(selected)), { version: 2, dishIds: ["naan", "kheer"] });
  assert.deepEqual(restoreSelection(data, serializeSelection(selected)), selected);
  assert.deepEqual(restoreSelection(data, "malformed"), EMPTY_SELECTION);
  assert.deepEqual(restoreSelection(data, JSON.stringify({ version: 999, dishIds: ["naan"] })), EMPTY_SELECTION);
  assert.deepEqual(restoreSelection(data, JSON.stringify({ version: 2, dishIds: ["naan", "deleted-dish", "naan", "concept-gerecht"] })).dishIds, ["naan"]);
  assert.deepEqual(restoreSelection(parseCatalog({ categories: productionCategories, dishes: [], arrangements: [] }), serializeSelection(selected)), EMPTY_SELECTION);
});

test("legacy arrangement preferences cannot leak into the new quote flow", () => {
  const data = catalog();
  const legacy = { dishIds: ["naan"], arrangementId: "klassiek-buffet", arrangementDishIds: ["butter-chicken", "palak-paneer", "basmati", "naan"] };
  assert.deepEqual(restoreSelection(data, JSON.stringify({ version: 1, selection: legacy })), EMPTY_SELECTION);
  assert.deepEqual(restoreSelection(data, serializeSelection(legacy)), { dishIds: ["naan"], arrangementId: null, arrangementDishIds: [] });
  assert.deepEqual(restoreSelection(data, JSON.stringify({ version: 2, dishIds: ["naan"], arrangementId: "klassiek-buffet" })), EMPTY_SELECTION);
});
