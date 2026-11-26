import Link from "next/link";
import type { Catalog, Dish } from "@/src/lib/catalog-schema";
import { FoodImage } from "@/src/components/food-image";
import { DishLabels } from "@/src/components/menu/dish-labels";
import { CategoryNavigation } from "@/src/components/menu/category-navigation";
import { Reveal } from "@/src/components/reveal";
import copy from "@/src/data/menu-content.json";

export function DemoNotice({ isDemo }: { isDemo: boolean }) {
  return isDemo ? <p className="demo-notice" role="note">{copy.demoNotice}</p> : null;
}

/** Presentation only: choosing dishes happens exclusively in the quote wizard. */
export function DishCard({ dish, delay = 0 }: { dish: Dish; delay?: number }) {
  const headingId = `product-${dish.id}`;
  return <Reveal as="article" className="product-card" aria-labelledby={headingId} delay={delay}>
    <div className="product-photo"><FoodImage src={dish.image} alt={dish.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw" /></div>
    <div className="product-name"><h3 id={headingId}>{dish.name}</h3><DishLabels dish={dish} /></div>
    <div className="product-description"><p>{dish.description}</p></div>
  </Reveal>;
}

export function MenuBrowser({ catalog }: { catalog: Catalog }) {
  return <div className="menu-browser">
    <DemoNotice isDemo={catalog.isDemo} />
    {!catalog.isDemo && catalog.dishes.length > 0 && copy.imageNote && <p className="menu-photo-note">{copy.imageNote}</p>}
    {catalog.categories.length > 1 && (
      <CategoryNavigation categories={catalog.categories} label={copy.categoryNavigationLabel} />
    )}
    {/* Kop en toelichting komen uit categories.json; wijzig daar name en description. */}
    {catalog.categories.map((category) => {
      const dishes = catalog.dishes.filter((dish) => dish.categoryId === category.id);
      return <section className="menu-category" aria-labelledby={`menu-${category.id}`} key={category.id}>
        <Reveal className="menu-category-heading"><h2 id={`menu-${category.id}`}>{category.name}</h2>{category.description && <p className="menu-category-description">{category.description}</p>}</Reveal>
        {dishes.length > 0 ? <div className="product-grid">{dishes.map((dish, index) => <DishCard key={dish.id} dish={dish} delay={(index % 3) * 0.06} />)}</div> : <p className="menu-category-empty">{copy.emptyCategory}</p>}
      </section>;
    })}
    {!catalog.dishes.length && <div className="menu-empty-note"><p>{copy.emptyMenuNote}</p><Link className="text-link" href="/offerte">{copy.quoteCta}</Link></div>}
  </div>;
}
