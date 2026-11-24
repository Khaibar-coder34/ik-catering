import { PageHero } from "@/src/components/sections";
import { QuoteWizard } from "@/src/components/forms/quote-wizard";
import { getCatalog } from "@/src/lib/catalog";
import { content } from "@/src/lib/site";
import { pageMetadata } from "@/src/lib/metadata";

const copy = content.quote;
export const metadata = pageMetadata(copy.metaTitle, copy.metaDescription, "/offerte");
export default function QuotePage() {
  return <><PageHero title={copy.title} description={copy.description} /><section className="section section-after-heading"><div className="container quote-container"><details className="quote-conditions"><summary>{copy.conditionsTitle}</summary>{copy.conditions.map(condition => <p key={condition.title}><strong>{condition.title}. </strong>{condition.text}</p>)}</details><QuoteWizard catalog={getCatalog()} /></div></section></>;
}
