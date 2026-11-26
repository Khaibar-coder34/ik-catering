import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal } from "@/src/components/reveal";

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}
export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="text-link">{children}</Link>;
}
export function PageHero({ title, description, className }: { title: string; description: string; className?: string }) {
  return (
    <section className="page-heading">
      <Reveal className={`container${className ? ` ${className}` : ""}`}>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </Reveal>
    </section>
  );
}
