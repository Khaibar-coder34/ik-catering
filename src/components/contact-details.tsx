import { Mail, MapPin, Phone } from "lucide-react";
import { content, site } from "@/src/lib/site";

export function ContactDetails() {
  const copy = content.contact;
  return <div className="contact-details">
    <h3>{copy.title}</h3>
    <dl>
      <div><dt><Mail size={18} aria-hidden="true" /><span className="sr-only">{copy.emailLabel}</span></dt><dd><a href={`mailto:${site.email}`}>{site.email}</a></dd></div>
      {site.phone && <div><dt><Phone size={18} aria-hidden="true" /><span className="sr-only">{copy.phoneLabel}</span></dt><dd><a href={`tel:${site.phone}`}>{site.phone}</a></dd></div>}
      {site.address && <div><dt><MapPin size={18} aria-hidden="true" /><span className="sr-only">{copy.addressLabel}</span></dt><dd>{site.address}, {site.postalCode ? `${site.postalCode} ` : ""}{site.city}</dd></div>}
    </dl>
  </div>;
}
