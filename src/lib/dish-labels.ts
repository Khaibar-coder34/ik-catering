import type { Dish } from "@/src/lib/catalog-schema";
import copy from "@/src/data/dish-labels.json";

export function getDishLabels(dish: Pick<Dish, "type" | "labels">) {
  const primary = { text: copy.types[dish.type], tone: dish.type };
  const seen = new Set([primary.text.toLocaleLowerCase("nl")]);
  return [primary, ...(dish.labels ?? []).flatMap((text) => {
    const key = text.toLocaleLowerCase("nl");
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ text, tone: "custom" }];
  })];
}
