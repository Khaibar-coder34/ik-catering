import Link from "next/link";
import { HeartHandshake, Truck, UtensilsCrossed } from "lucide-react";
import { FoodImage } from "@/src/components/food-image";
import { Reveal } from "@/src/components/reveal";
import { TextLink } from "@/src/components/sections";
import { content, site } from "@/src/lib/site";
import { pageMetadata } from "@/src/lib/metadata";

const copy = content.home;
const icons = { utensils: UtensilsCrossed, truck: Truck, heart: HeartHandshake };
export const metadata = pageMetadata(copy.metaTitle, copy.metaDescription, "/");

export default function Home() {
  return <>
    <section className="home-hero container">
      <Reveal className="hero-copy">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className="hero-description">{copy.description}</p>
        <div className="button-group">
          <Link href="/menu" className="button button-primary">{copy.menuCta}</Link>
          <Link href="/offerte" className="button button-outline">{site.quoteLabel}</Link>
        </div>
        <span className="hero-note">{copy.note}</span>
      </Reveal>
      <Reveal as="figure" className="hero-photo" delay={0.1}><FoodImage src={copy.image} alt={copy.imageAlt} fill sizes="(max-width: 860px) 100vw, 50vw" preload /><figcaption>{copy.imageCaption}</figcaption></Reveal>
    </section>
    <section className="service-strip"><div className="container service-grid">{copy.services.map((item, index) => { const Icon = icons[item.icon as keyof typeof icons]; return <Reveal className="service-item" delay={index * 0.07} key={item.title}><Icon size={25} strokeWidth={1.5} aria-hidden="true" /><div><h2>{item.title}</h2><p>{item.text}</p></div></Reveal>; })}</div></section>
    <section className="section container">
      <Reveal className="home-invitation">
        <div>
          <h2>{copy.bottomTitle}</h2>
          <p>{copy.bottomText}</p>
          <TextLink href="/over-ons">{copy.aboutLink}</TextLink>
        </div>
        <div className="invitation-actions">
          <Link href="/offerte" className="button button-primary">{copy.bottomCta}</Link>
          <TextLink href="/b2b">{copy.b2bLink}</TextLink>
        </div>
      </Reveal>
    </section>
  </>;
}
