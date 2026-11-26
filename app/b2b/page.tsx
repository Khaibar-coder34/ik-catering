import { RequestForm } from "@/src/components/forms/request-form";
import { ContactDetails } from "@/src/components/contact-details";
import { Reveal } from "@/src/components/reveal";
import { content } from "@/src/lib/site";
import { pageMetadata } from "@/src/lib/metadata";

const copy = content.b2b;
export const metadata = pageMetadata(copy.metaTitle, copy.metaDescription, "/b2b");
export default function B2BPage() {
  return <section className="section container b2b-layout">
    <Reveal className="b2b-copy">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1>{copy.title}</h1>
      <p>{copy.description}</p>
      <p>{copy.detail}</p>
      <ContactDetails />
    </Reveal>
    <Reveal delay={0.1}>
      <h2 className="form-heading">{copy.formTitle}</h2>
      <RequestForm kind="contact" audience="business" />
    </Reveal>
  </section>;
}
