import Link from "next/link";
import { Brand } from "@/src/components/brand";
import { site } from "@/src/lib/site";

export function Footer() {
  return <footer className="site-footer"><div className="container footer-main"><div><Brand /><p>{site.footer.intro}</p></div><div className="footer-contact">{site.phone && <a href={`tel:${site.phone}`}>{site.phone}</a>}<a href={`mailto:${site.email}`}>{site.email}</a>{site.address && <span>{site.address}, {site.postalCode ? `${site.postalCode} ` : ""}{site.city}</span>}</div></div><div className="container footer-bottom"><span>© {site.footer.copyright}</span><div>{site.kvk && <span>KvK {site.kvk}</span>}{site.vat && <span>BTW {site.vat}</span>}<Link href="/privacy">{site.footer.privacyLabel}</Link>{site.socials.map(social => <a href={social.href} key={social.href} rel="noopener noreferrer">{social.label}</a>)}</div></div></footer>;
}
