import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "@/src/components/header";
import { Footer } from "@/src/components/footer";
import { SelectionProvider } from "@/src/components/selection-provider";
import { getCatalog } from "@/src/lib/catalog";
import { content, site, siteUrl } from "@/src/lib/site";
import "./globals.css";

const sans = localFont({ src: "../public/fonts/manrope-latin-variable.woff2", variable: "--font-manrope", display: "swap", weight: "200 800" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${content.home.metaTitle} | ${site.name}`, template: `%s | ${site.name}` },
  description: content.home.metaDescription,
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg", apple: "/images/branding/apple-touch-icon.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const catalog = getCatalog();
  const structuredData = {
    "@context": "https://schema.org", "@graph": [
      { "@type": "Organization", "@id": `${siteUrl}/#organization`, name: site.name, legalName: site.legalName, url: siteUrl, email: site.email, logo: `${siteUrl}/images/branding/indiase-keuken-logo.png`, vatID: site.vat, identifier: { "@type": "PropertyValue", propertyID: "KvK", value: site.kvk }, foundingDate: String(site.foundedYear),
        ...(site.phone ? { telephone: site.phone } : {}),
        address: { "@type": "PostalAddress", addressLocality: site.city, addressCountry: "NL", ...(site.address ? { streetAddress: site.address } : {}), ...(site.postalCode ? { postalCode: site.postalCode } : {}) } },
      { "@type": "Service", "@id": `${siteUrl}/#catering`, name: site.tagline, serviceType: site.tagline, provider: { "@id": `${siteUrl}/#organization` }, areaServed: { "@type": "AdministrativeArea", name: site.serviceArea }, url: siteUrl },
    ],
  };
  return (
    <html
      lang="nl"
      className={`${sans.variable} antialiased`}
    >
      <body>
        <a className="skip-link" href="#main-content">{site.ui.skipLink}</a>
        <SelectionProvider catalog={catalog}>
          {catalog.isDemo && <div className="demo-banner">{site.ui.demoBanner}</div>}
          <Header />
          <main id="main-content" tabIndex={-1}>{children}</main>
          <Footer />
        </SelectionProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      </body>
    </html>
  );
}
