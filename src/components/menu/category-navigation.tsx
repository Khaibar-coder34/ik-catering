"use client";

import { useEffect, useRef, useState } from "react";

type Category = { id: string; name: string };

export function CategoryNavigation({ categories, label }: { categories: Category[]; label: string }) {
  const navigation = useRef<HTMLElement>(null);
  const active = useRef(categories[0]?.id ?? "");
  const [activeId, setActiveId] = useState(categories[0]?.id ?? "");

  useEffect(() => {
    const nav = navigation.current;
    if (!nav) return;
    const header = document.querySelector<HTMLElement>(".site-header");
    const headings = categories.map(category => ({
      id: category.id,
      element: document.getElementById(`menu-${category.id}`),
    }));
    let frame = 0;

    function update() {
      frame = 0;
      if (!nav) return;
      // De actieve kop volgt de leespositie onder beide vaste navigatiebalken.
      const readingLine = (header?.getBoundingClientRect().bottom ?? 0) + nav.getBoundingClientRect().height + 24;
      let next = headings[0]?.id ?? "";
      for (const heading of headings) {
        if (heading.element && heading.element.getBoundingClientRect().top <= readingLine) next = heading.id;
      }
      if (active.current !== next) {
        active.current = next;
        setActiveId(next);
      }
    }

    function scheduleUpdate() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    const resize = new ResizeObserver(scheduleUpdate);
    resize.observe(nav);
    if (header) resize.observe(header);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [categories]);

  useEffect(() => {
    const nav = navigation.current;
    const link = nav?.querySelector<HTMLAnchorElement>('[aria-current="location"]');
    if (!nav || !link || nav.scrollWidth <= nav.clientWidth) return;
    const navBounds = nav.getBoundingClientRect();
    const linkBounds = link.getBoundingClientRect();
    const padding = 8;
    let shift = 0;
    if (linkBounds.left < navBounds.left + padding) shift = linkBounds.left - navBounds.left - padding;
    else if (linkBounds.right > navBounds.right - padding) shift = linkBounds.right - navBounds.right + padding;
    if (shift) {
      // Alleen de horizontale balk beweegt: de leespositie op de pagina blijft gelijk.
      nav.scrollTo({ left: nav.scrollLeft + shift, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  }, [activeId]);

  return <nav ref={navigation} className="menu-category-nav" aria-label={label}>
    {categories.map(category => (
      <a href={`#menu-${category.id}`} key={category.id} aria-current={activeId === category.id ? "location" : undefined}>
        {category.name}
      </a>
    ))}
  </nav>;
}
