import { z } from "zod";

const identifier = z.string().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const imagePath = z.string().max(300).refine((value) => value === "" || /^\/images\/[a-zA-Z0-9/_-]+\.(?:webp|avif|png|jpe?g|svg)$/.test(value), "Gebruik een lokaal afbeeldingspad onder /images/.");

// JSON ondersteunt geen //-comments. Gebruik _comment voor hulp aan de redacteur;
// deze tekst wordt bij het inlezen verwijderd en nooit aan bezoekers doorgegeven.
const editorComment = z.string().max(2000).optional();
function stripEditorComment<T extends { _comment?: string }>(value: T): Omit<T, "_comment"> {
  const publicData = { ...value };
  delete publicData._comment;
  return publicData;
}

export const categorySchema = z.object({
  _comment: editorComment,
  id: identifier,
  slug: identifier,
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  sortOrder: z.number().int().nonnegative(),
  isPublished: z.boolean(),
}).strict().transform(stripEditorComment);

export const dishSchema = z.object({
  _comment: editorComment,
  id: identifier,
  slug: identifier,
  name: z.string().min(1).max(100),
  categoryId: identifier,
  description: z.string().min(1).max(1000),
  image: imagePath,
  type: z.enum(["vegetarian", "vegan", "meat", "fish"]),
  labels: z.array(z.string().trim().min(1).max(18).regex(/^[^\u0000-\u001f\u007f]+$/, "Gebruik één regel per label.")).max(3).optional(),
  sortOrder: z.number().int().nonnegative(),
  isPublished: z.boolean(),
  allergens: z.array(z.string().min(1).max(100)).max(30).optional(),
}).strict().transform(stripEditorComment);

export const customizationSchema = z.object({
  allowedDishIds: z.array(identifier).min(1).max(100),
  minDishes: z.number().int().min(1).max(100),
  maxDishes: z.number().int().min(1).max(100),
  allowRemove: z.boolean(),
  allowAdd: z.boolean(),
}).strict();

export const arrangementSchema = z.object({
  id: identifier,
  slug: identifier,
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  image: imagePath,
  dishIds: z.array(identifier).min(1).max(100),
  customizable: z.boolean(),
  isPublished: z.boolean(),
  sortOrder: z.number().int().nonnegative(),
  customization: customizationSchema.nullable(),
}).strict().superRefine((arrangement, ctx) => {
  if (arrangement.customizable !== (arrangement.customization !== null)) {
    ctx.addIssue({ code: "custom", path: ["customization"], message: "Een aanpasbaar arrangement vereist een customization-configuratie; een vast arrangement gebruikt null." });
  }
  const config = arrangement.customization;
  if (config && (config.minDishes > config.maxDishes || arrangement.dishIds.length < config.minDishes || arrangement.dishIds.length > config.maxDishes)) {
    ctx.addIssue({ code: "custom", path: ["customization"], message: "De basissamenstelling moet binnen minDishes en maxDishes vallen." });
  }
  if (config && arrangement.dishIds.some((id) => !config.allowedDishIds.includes(id))) {
    ctx.addIssue({ code: "custom", path: ["customization", "allowedDishIds"], message: "Alle basisgerechten moeten toegestaan zijn." });
  }
  if (new Set(arrangement.dishIds).size !== arrangement.dishIds.length || (config && new Set(config.allowedDishIds).size !== config.allowedDishIds.length)) {
    ctx.addIssue({ code: "custom", path: ["dishIds"], message: "Gerechtverwijzingen mogen niet dubbel voorkomen." });
  }
});

export type Category = z.infer<typeof categorySchema>;
export type Dish = z.infer<typeof dishSchema>;
export type Arrangement = z.infer<typeof arrangementSchema>;
export type Catalog = {
  categories: Category[];
  dishes: Dish[];
  arrangements: Arrangement[];
  isDemo: boolean;
};

export type CatalogSource = { categories: unknown; dishes: unknown; arrangements: unknown };

/** Validate repository data before deriving the public catalog. */
export function parseCatalog(source: CatalogSource, isDemo = false): Catalog {
  const categories = z.array(categorySchema).parse(source.categories);
  const dishes = z.array(dishSchema).parse(source.dishes);
  const arrangements = z.array(arrangementSchema).parse(source.arrangements);
  for (const [name, entries] of [["categories", categories], ["dishes", dishes], ["arrangements", arrangements]] as const) {
    for (const key of ["id", "slug"] as const) {
      if (new Set(entries.map((entry) => entry[key])).size !== entries.length) throw new Error(`${name}: dubbele ${key}.`);
    }
  }
  const categoryIds = new Set(categories.map((category) => category.id));
  const dishIds = new Set(dishes.map((dish) => dish.id));
  for (const dish of dishes) {
    if (!categoryIds.has(dish.categoryId)) throw new Error(`Gerecht ${dish.id}: categorie ${dish.categoryId} bestaat niet.`);
  }
  for (const arrangement of arrangements) {
    for (const id of [...arrangement.dishIds, ...(arrangement.customization?.allowedDishIds ?? [])]) {
      if (!dishIds.has(id)) throw new Error(`Arrangement ${arrangement.id}: gerecht ${id} bestaat niet.`);
    }
  }
  const byOrder = <T extends { sortOrder: number; name: string }>(a: T, b: T) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "nl");
  const publicCategories = categories.filter((category) => category.isPublished).sort(byOrder);
  const publicCategoryIds = new Set(publicCategories.map((category) => category.id));
  const publicDishes = dishes.filter((dish) => dish.isPublished && publicCategoryIds.has(dish.categoryId)).sort(byOrder);
  const publicDishIds = new Set(publicDishes.map((dish) => dish.id));
  const publicArrangements = arrangements.filter((arrangement) => arrangement.isPublished && arrangement.dishIds.every((id) => publicDishIds.has(id)))
    .map((arrangement) => ({ ...arrangement, customization: arrangement.customization ? { ...arrangement.customization, allowedDishIds: arrangement.customization.allowedDishIds.filter((id) => publicDishIds.has(id)) } : null }))
    .sort(byOrder);
  return { categories: publicCategories, dishes: publicDishes, arrangements: publicArrangements, isDemo };
}
