import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MenuBrowser } from "@/src/components/menu/menu-browser";
import { PageHero } from "@/src/components/sections";
import { getCatalog } from "@/src/lib/catalog";
import { content, site } from "@/src/lib/site";
import { pageMetadata } from "@/src/lib/metadata";

const copy = content.menu;
export const metadata = pageMetadata(copy.metaTitle, copy.metaDescription, "/menu");
export default function MenuPage() {
  return <><PageHero title={copy.title} description={copy.description} /><section className="section section-after-heading"><div className="container"><MenuBrowser catalog={getCatalog()} /><div className="menu-cta"><p>{copy.cta}</p><Link className="button button-primary" href="/offerte">{site.quoteLabel}<ArrowRight size={18} aria-hidden="true" /></Link></div></div></section></>;
}
