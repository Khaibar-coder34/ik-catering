import type { MetadataRoute } from "next";
import { publicRoutes } from "@/src/lib/metadata";
import { siteUrl } from "@/src/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({ url: `${siteUrl}${route}`, priority: route === "/" ? 1 : route === "/privacy" ? 0.3 : 0.7 }));
}
