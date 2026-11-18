import categories from "@/src/data/categories.json";
import dishes from "@/src/data/dishes.json";
import arrangements from "@/src/data/arrangements.json";
import demoCategories from "@/src/data/demo/categories.json";
import demoDishes from "@/src/data/demo/dishes.json";
import demoArrangements from "@/src/data/demo/arrangements.json";
import { parseCatalog } from "./catalog-schema";

export type { Arrangement, Catalog, Category, Dish } from "./catalog-schema";

export function isDemoCatalogEnabled(environment = process.env.NODE_ENV, setting = process.env.CATALOG_DEMO) {
  return environment !== "production" && setting === "true";
}

export function getCatalog() {
  // Never publish demonstration dishes, even if the flag was accidentally left on in Netlify.
  return isDemoCatalogEnabled()
    ? parseCatalog({ categories: demoCategories, dishes: demoDishes, arrangements: demoArrangements }, true)
    : parseCatalog({ categories, dishes, arrangements });
}
