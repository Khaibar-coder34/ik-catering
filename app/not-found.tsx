import Link from "next/link";
import { ArrowUpRight, Flower2 } from "lucide-react";
import { site } from "@/src/lib/site";

export default function NotFound() {
  return <section className="section not-found"><div className="container"><Flower2 size={62} strokeWidth={1} aria-hidden="true" /><p className="eyebrow">404</p><h1>{site.ui.notFoundTitle}</h1><p className="lead">{site.ui.notFoundDescription}</p><div className="button-group"><Link href="/" className="button button-primary">{site.ui.backHome}<ArrowUpRight size={18} aria-hidden="true" /></Link><Link href="/menu" className="text-link">Menu<ArrowUpRight size={18} aria-hidden="true" /></Link></div></div></section>;
}
