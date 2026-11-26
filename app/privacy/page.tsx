import { PageHero } from "@/src/components/sections";
import { content } from "@/src/lib/site";
import { pageMetadata } from "@/src/lib/metadata";

const copy = content.privacy;
export const metadata = pageMetadata(copy.metaTitle, copy.metaDescription, "/privacy");
export default function PrivacyPage() {
  return <><PageHero title={copy.title} description={copy.description} className="prose" /><section className="section section-after-heading"><div className="container prose">{copy.sections.map(section => <section key={section.title}><h2>{section.title}</h2><p>{section.text}</p></section>)}<section><h2>{copy.linksTitle}</h2><ul>{copy.links.map(link => <li key={link.href}><a href={link.href} rel="noopener noreferrer">{link.label}</a></li>)}</ul></section></div></section></>;
}
