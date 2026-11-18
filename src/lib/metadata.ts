import type { Metadata } from "next";
import { site, siteUrl } from "@/src/lib/site";

export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title: { absolute: `${title} | ${site.name}` }, description,
    alternates: { canonical: `${siteUrl}${path}` },
    openGraph: {
      title: `${title} | ${site.name}`, description, url: `${siteUrl}${path}`,
      siteName: site.name, locale: "nl_NL", type: "website",
      images: [{ url: "/images/branding/social-preview.jpg", width: 1200, height: 630, alt: `${site.name} — ${site.tagline}` }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/images/branding/social-preview.jpg"] },
  };
}

export const publicRoutes = ["/", "/menu", "/over-ons", "/b2b", "/offerte", "/privacy"];
