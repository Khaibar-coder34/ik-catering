"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import type { Catalog } from "@/src/lib/catalog-schema";
import { useSelection } from "@/src/components/selection-provider";
import { CompactMenuSelection } from "@/src/components/menu/compact-menu-selection";
import { RequestForm } from "@/src/components/forms/request-form";
import { formsContent as copy } from "@/src/lib/content";

export function QuoteWizard({ catalog }: { catalog: Catalog }) {
  const [step, setStep] = useState<1 | 2>(1);
  const { selection } = useSelection();
  const dishIds = selection.dishIds;
  const summary = dishIds.length === 1 ? copy.selectedSingleSummary : dishIds.length ? copy.selectedSummary.replace("{count}", String(dishIds.length)) : copy.emptySummary;

  function goTo(next: 1 | 2) {
    setStep(next);
    requestAnimationFrame(() => {
      const heading = document.getElementById(next === 1 ? "quote-menu-title" : "quote-details-title");
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    });
  }

  return <div className="quote-wizard">
    <ol className="quote-steps" aria-label={copy.stepsLabel}>
      <li className={step === 1 ? "is-current" : "is-complete"} aria-current={step === 1 ? "step" : undefined}><span>{step === 2 ? <Check size={16} aria-hidden="true" /> : "1"}</span>{copy.menuStep}</li>
      <li className={step === 2 ? "is-current" : ""} aria-current={step === 2 ? "step" : undefined}><span>2</span>{copy.detailsStep}</li>
    </ol>
    <section className="quote-step" hidden={step !== 1} style={step !== 1 ? { display: "none" } : undefined} aria-labelledby="quote-menu-title">
      <h2 id="quote-menu-title" tabIndex={-1}>{copy.menuStep}</h2>
      <p>{copy.menuIntro}</p>
      <CompactMenuSelection catalog={catalog} />
      <div className="quote-actions quote-selection-actions">
        <p className="form-step-summary" aria-live="polite">{summary}</p>
        <button className="button button-primary" type="button" onClick={() => goTo(2)}>{copy.next}</button>
      </div>
    </section>
    <section className="quote-step" hidden={step !== 2} style={step !== 2 ? { display: "none" } : undefined} aria-labelledby="quote-details-title">
      <h2 id="quote-details-title" tabIndex={-1}>{copy.detailsStep}</h2>
      <p className="form-step-summary">{summary}</p>
      {/* Keep the form mounted: back/next preserves typed values, radio choices and errors. */}
      <RequestForm kind="quote" dishIds={dishIds} active={step === 2} onBack={() => goTo(1)} />
    </section>
  </div>;
}
