import Link from "next/link";
import Image from "next/image";
import logo from "@/public/images/branding/indiase-keuken-logo.png";
import site from "@/src/data/site.json";

export function Brand({ onClick }: { onClick?: () => void }) {
  return <Link href="/" className="brand" aria-label={site.ui.homeLabel} onClick={onClick}>
    <Image src={logo} alt="" className="brand-logo" sizes="144px" loading="eager" />
    <span className="brand-caption">{site.ui.brandCaption}</span>
  </Link>;
}
