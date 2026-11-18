import { z } from "zod";
import type { Catalog } from "./catalog-schema";

const id = z.string().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const selectionSchema = z.object({
  dishIds: z.array(id).max(100),
  arrangementId: z.null(),
  arrangementDishIds: z.array(id).length(0),
}).strict();

export type Selection = z.infer<typeof selectionSchema>;
export const EMPTY_SELECTION: Selection = { dishIds: [], arrangementId: null, arrangementDishIds: [] };

export class SelectionError extends Error {
  constructor(message = "Uw selectie is gewijzigd of niet meer beschikbaar. Controleer uw gerechten opnieuw.") {
    super(message);
    this.name = "SelectionError";
  }
}

const unique = (values: string[]) => [...new Set(values)];
const publishedIds = (catalog: Catalog) => new Set(catalog.dishes.filter((dish) => dish.isPublished && catalog.categories.some((category) => category.id === dish.categoryId && category.isPublished)).map((dish) => dish.id));

/** Server-side validation resolves identifiers against the current published menu. */
export function validateSelection(catalog: Catalog, input: unknown): Selection {
  const result = selectionSchema.safeParse(input);
  if (!result.success) throw new SelectionError();
  const available = publishedIds(catalog);
  if (result.data.dishIds.some((dishId) => !available.has(dishId))) throw new SelectionError();
  return { dishIds: unique(result.data.dishIds), arrangementId: null, arrangementDishIds: [] };
}

export function resolveSelection(catalog: Catalog, input: unknown) {
  const selection = validateSelection(catalog, input);
  return {
    dishIds: selection.dishIds,
    dishes: selection.dishIds.map((dishId) => catalog.dishes.find((dish) => dish.id === dishId)!),
  };
}

/** V2 stores only individual choices. V1 arrangement selections are deliberately not migrated. */
export function restoreSelection(catalog: Catalog, raw: string | null): Selection {
  if (!raw || raw.length > 30_000) return EMPTY_SELECTION;
  try {
    const parsed: unknown = JSON.parse(raw);
    const saved = z.object({ version: z.literal(2), dishIds: z.array(id).max(100) }).strict().parse(parsed);
    const available = publishedIds(catalog);
    const dishIds = unique(saved.dishIds.filter((dishId) => available.has(dishId)));
    return { dishIds, arrangementId: null, arrangementDishIds: [] };
  } catch {
    return EMPTY_SELECTION;
  }
}

export function serializeSelection(selection: Pick<Selection, "dishIds">) {
  return JSON.stringify({ version: 2, dishIds: unique(selection.dishIds) });
}

export function removeSelectionDish(catalog: Catalog, selection: Selection, dishId: string): Selection {
  return validateSelection(catalog, { ...selection, dishIds: selection.dishIds.filter((id) => id !== dishId) });
}

export function toggleSelectionDish(catalog: Catalog, selection: Selection, dishId: string): Selection {
  return selection.dishIds.includes(dishId)
    ? removeSelectionDish(catalog, selection, dishId)
    : validateSelection(catalog, { ...selection, dishIds: [...selection.dishIds, dishId] });
}
