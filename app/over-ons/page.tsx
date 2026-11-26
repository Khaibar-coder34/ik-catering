import { FoodImage } from "@/src/components/food-image";
import { RequestForm } from "@/src/components/forms/request-form";
import { ContactDetails } from "@/src/components/contact-details";
import { Reveal } from "@/src/components/reveal";
import { content, site } from "@/src/lib/site";
import { pageMetadata } from "@/src/lib/metadata";

const copy = content.about;
export const metadata = pageMetadata(copy.metaTitle, copy.metaDescription, "/over-ons");
export default function AboutPage() {
  return <>
    <section className="section container about-intro">
      <Reveal>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
        <p>{copy.detail}</p>
      </Reveal>
      <Reveal as="figure" className="about-photo" delay={0.1}>
        <FoodImage src={copy.image} alt={copy.imageAlt} fill sizes="(max-width: 860px) 100vw, 45vw" preload />
        <figcaption>{site.ui.illustrative}</figcaption>
      </Reveal>
    </section>
    <section id="contact" className="section section-tinted">
      <div className="container contact-layout">
        <Reveal>
          <h2>{copy.contactTitle}</h2>
          <p className="contact-intro">{copy.contactText}</p>
          <ContactDetails />
        </Reveal>
        <Reveal delay={0.08}><RequestForm kind="contact" audience="private" /></Reveal>
      </div>
    </section>
  </>;
}
