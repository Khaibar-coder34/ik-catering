"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Brand } from "@/src/components/brand";
import site from "@/src/data/site.json";

export function Header() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const reduceMotion = useReducedMotion();
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpenPath(null);
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        toggle.current?.focus();
      }
    };
    const outside = (event: PointerEvent | FocusEvent) => {
      if (event.target instanceof Node && !header.current?.contains(event.target)) close();
    };
    const desktop = window.matchMedia("(min-width: 861px)");
    const leaveMobile = (event: MediaQueryListEvent) => {
      if (event.matches) close();
    };
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    desktop.addEventListener("change", leaveMobile);
    window.addEventListener("popstate", close);
    return () => {
      document.removeEventListener("keydown", escape);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", outside);
      desktop.removeEventListener("change", leaveMobile);
      window.removeEventListener("popstate", close);
    };
  }, [open]);
  return <header ref={header} className="site-header">
    <div className="container header-inner">
      <Brand onClick={() => setOpenPath(null)} />
      <nav className="desktop-nav" aria-label={site.ui.navigationLabel}>
        {site.navigation.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</Link>)}
      </nav>
      <div className="header-actions">
        <Link href="/offerte" className="button button-primary header-cta" onClick={() => setOpenPath(null)}>{site.quoteLabel}</Link>
        <button ref={toggle} type="button" className="menu-toggle" data-open={open} aria-label={open ? site.ui.menuClose : site.ui.menuOpen} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpenPath(open ? null : pathname)}>
          <span className="menu-toggle-icon" aria-hidden="true">
            <span className="menu-toggle-line" />
            <span className="menu-toggle-line" />
            <span className="menu-toggle-line" />
          </span>
        </button>
      </div>
    </div>
    {/* Sluitende links zijn meteen inert, ook terwijl de hoogte nog animeert. */}
    <motion.div className="mobile-nav-panel" initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }} transition={{ duration: reduceMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }} aria-hidden={!open} inert={!open}>
      <nav id="mobile-navigation" className="mobile-nav is-open" aria-label={site.ui.navigationLabel}>
        {site.navigation.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} onClick={() => setOpenPath(null)}>{item.label}</Link>)}
      </nav>
    </motion.div>
  </header>;
}
