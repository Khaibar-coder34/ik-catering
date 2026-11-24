import type { Dish } from "@/src/lib/catalog-schema";
import { getDishLabels } from "@/src/lib/dish-labels";

export function DishLabels({ dish, id }: { dish: Pick<Dish, "type" | "labels">; id?: string }) {
  return <span className="dish-labels" id={id}>{getDishLabels(dish).map((label) =>
    <span className={`dish-label dish-label-${label.tone}`} key={label.text}>{label.text}{" "}</span>
  )}</span>;
}
