import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import site from "@/src/data/site.json";

export function Brand() {
  return <Link href="/" className="brand" title={site.ui.homeLabel}><span className="brand-icon"><UtensilsCrossed size={21} strokeWidth={1.7} aria-hidden="true" /></span><span>{site.name}</span></Link>;
}
