"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, X, UtensilsCrossed } from "lucide-react";
import site from "@/src/data/site.json";

export function Header() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const escape = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpenPath(null); toggle.current?.focus(); } };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);
  return <header className="site-header">
    <div className="container header-inner">
      <Link href="/" className="brand" title={site.ui.homeLabel} onClick={() => setOpenPath(null)}>
        <span className="brand-icon"><UtensilsCrossed size={21} aria-hidden="true" /></span><span>{site.name}</span>
      </Link>
      <nav className="desktop-nav" aria-label={site.ui.navigationLabel}>
        {site.navigation.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</Link>)}
      </nav>
      <div className="header-actions">
        <Link href="/offerte" className="button button-primary header-cta" onClick={() => setOpenPath(null)}>{site.quoteLabel}<ArrowRight size={17} aria-hidden="true" /></Link>
        <button ref={toggle} type="button" className="menu-toggle" aria-label={open ? site.ui.menuClose : site.ui.menuOpen} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpenPath(open ? null : pathname)}>{open ? <X /> : <Menu />}</button>
      </div>
    </div>
    <nav id="mobile-navigation" className={`mobile-nav ${open ? "is-open" : ""}`} aria-label={site.ui.navigationLabel} hidden={!open}>
      {site.navigation.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} onClick={() => setOpenPath(null)}>{item.label}<ArrowRight size={16} aria-hidden="true" /></Link>)}
    </nav>
  </header>;
}
