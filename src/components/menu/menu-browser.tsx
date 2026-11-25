import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Catalog, Dish } from "@/src/lib/catalog-schema";
import { FoodImage } from "@/src/components/food-image";
import { DishLabels } from "@/src/components/menu/dish-labels";
import copy from "@/src/data/menu-content.json";

export function DemoNotice({ isDemo }: { isDemo: boolean }) {
  return isDemo ? <p className="demo-notice" role="note">{copy.demoNotice}</p> : null;
}

/** Presentation only: choosing dishes happens exclusively in the quote wizard. */
export function DishCard({ dish }: { dish: Dish }) {
  const headingId = `product-${dish.id}`;
  return <article className="product-card" aria-labelledby={headingId}>
    <div className="product-photo"><FoodImage src={dish.image} alt={dish.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw" /></div>
    <div className="product-name"><h3 id={headingId}>{dish.name}</h3><DishLabels dish={dish} /></div>
    <div className="product-description"><p>{dish.description}</p></div>
  </article>;
}

export function MenuBrowser({ catalog }: { catalog: Catalog }) {
  return <div className="menu-browser">
    <DemoNotice isDemo={catalog.isDemo} />
    {!catalog.isDemo && catalog.dishes.length > 0 && <p className="menu-photo-note">{copy.imageNote}</p>}
    {/* Kop en toelichting komen uit categories.json; wijzig daar name en description. */}
    {catalog.categories.map((category) => {
      const dishes = catalog.dishes.filter((dish) => dish.categoryId === category.id);
      return <section className="menu-category" aria-labelledby={`menu-${category.id}`} key={category.id}>
        <div className="menu-category-heading"><h2 id={`menu-${category.id}`}>{category.name}</h2>{category.description && <p className="menu-category-description">{category.description}</p>}</div>
        {dishes.length > 0 ? <div className="product-grid">{dishes.map((dish) => <DishCard key={dish.id} dish={dish} />)}</div> : <p className="menu-category-empty">{copy.emptyCategory}</p>}
      </section>;
    })}
    {!catalog.dishes.length && <div className="menu-empty-note"><p>{copy.emptyMenuNote}</p><Link className="text-link" href="/offerte">{copy.quoteCta}<ArrowUpRight size={17} aria-hidden="true" /></Link></div>}
  </div>;
}
