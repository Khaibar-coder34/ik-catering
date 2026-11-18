"use client";

import type { Catalog } from "@/src/lib/catalog-schema";
import { FoodImage } from "@/src/components/food-image";
import { useSelection } from "@/src/components/selection-provider";
import copy from "@/src/data/menu-content.json";

export function CompactMenuSelection({ catalog }: { catalog: Catalog }) {
  const { selection, toggleDish, count } = useSelection();
  return <div className="compact-menu-selection">
    {catalog.isDemo && <p className="demo-notice" role="note">{copy.demoNotice}</p>}
    {!catalog.dishes.length && <p className="selection-empty-note">{copy.selectionEmpty}</p>}
    {catalog.categories.map((category) => {
      const dishes = catalog.dishes.filter((dish) => dish.categoryId === category.id);
      return <fieldset className="compact-category" key={category.id}>
        <legend>{category.name}</legend>
        {dishes.length > 0 ? <div className="compact-dish-grid">{dishes.map((dish) => {
          const selected = selection.dishIds.includes(dish.id);
          return <label className={`compact-dish${selected ? " is-selected" : ""}`} key={dish.id}>
            <span className="compact-dish-image" aria-hidden="true"><FoodImage src={dish.image} alt="" fill sizes="56px" /></span>
            <span className="compact-dish-name">{dish.name}</span>
            <input type="checkbox" name="dishIds" value={dish.id} checked={selected} onChange={() => toggleDish(dish.id)} />
          </label>;
        })}</div> : <p className="compact-category-empty">{copy.emptyCategory}</p>}
      </fieldset>;
    })}
    <p className="selection-total" role="status" aria-live="polite">{count} {count === 1 ? copy.selectedSingular : copy.selectedPlural}</p>
  </div>;
}
