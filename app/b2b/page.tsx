import { RequestForm } from "@/src/components/forms/request-form";
import { ContactDetails } from "@/src/components/contact-details";
import { content } from "@/src/lib/site";
import { pageMetadata } from "@/src/lib/metadata";

const copy = content.b2b;
export const metadata = pageMetadata(copy.metaTitle, copy.metaDescription, "/b2b");
export default function B2BPage() {
  return <section className="section container b2b-layout"><div className="b2b-copy"><p className="eyebrow">{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.description}</p><p>{copy.detail}</p><ContactDetails /></div><div><h2 className="form-heading">{copy.formTitle}</h2><RequestForm kind="contact" audience="business" /></div></section>;
}
