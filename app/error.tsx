"use client";

import { Flower2, RotateCcw } from "lucide-react";
import site from "@/src/data/site.json";

export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return <section className="section not-found"><div className="container"><Flower2 size={56} strokeWidth={1.1} aria-hidden="true" /><h1>{site.ui.errorTitle}</h1><p className="lead">{site.ui.errorDescription}</p><div className="button-group"><button type="button" className="button button-primary" onClick={() => retry()}><RotateCcw size={17} aria-hidden="true" />{site.ui.retryLabel}</button><a className="text-link" href={`mailto:${site.email}`}>{site.email}</a></div></div></section>;
}
