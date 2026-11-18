"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { requestSchema, validationErrors, type Audience } from "@/src/lib/validation";
import { Turnstile } from "@/src/components/forms/turnstile";
import { formsContent as copy } from "@/src/lib/content";

type RequestFormProps =
  | { kind: "contact"; audience: Audience }
  | { kind: "quote"; dishIds: string[]; onBack: () => void; active?: boolean };
type FieldName = keyof typeof copy.fields;
interface FormResponse { ok: boolean; reference?: string; confirmationSent?: boolean; message?: string; fieldErrors?: Record<string, string> }

export function RequestForm(props: RequestFormProps) {
  const { kind } = props;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<FormResponse | null>(null);
  const [audience, setAudience] = useState<Audience>("private");
  const [token, setToken] = useState("");
  const [verificationReset, setVerificationReset] = useState(0);
  const startedAt = useRef(0);
  const submitting = useRef(false);
  const attempt = useRef<{ fingerprint: string; id: string } | null>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const onToken = useCallback((value: string) => setToken(value), []);
  const prefix = kind === "contact" ? `contact-${props.audience}` : "quote";
  const idFor = (name: string) => `${prefix}-${name}`;
  const active = kind === "contact" || props.active !== false;

  useEffect(() => { startedAt.current = Date.now(); }, []);
  useEffect(() => { if (success) successRef.current?.focus(); }, [success]);

  function field(name: FieldName, options: { type?: string; autocomplete?: string; full?: boolean; min?: string; max?: string; maxLength?: number } = {}) {
    const errorId = `${idFor(name)}-error`;
    const shared = { id: idFor(name), name, required: true, "aria-invalid": errors[name] ? true as const : undefined, "aria-describedby": errors[name] ? errorId : undefined };
    return <div className={`field${options.full ? " field-full" : ""}`} key={name}>
      <label htmlFor={idFor(name)}>{copy.fields[name]}<span aria-hidden="true"> *</span></label>
      {options.type === "textarea" ? <textarea {...shared} rows={5} maxLength={4000} /> : <input {...shared} type={options.type ?? "text"} autoComplete={options.autocomplete} min={options.min} max={options.max} maxLength={options.maxLength ?? 100} />}
      {errors[name] && <p className="field-error" id={errorId}>{errors[name]}</p>}
    </div>;
  }

  function focusError(fieldErrors: Record<string, string>) {
    const name = Object.keys(fieldErrors)[0];
    requestAnimationFrame(() => document.getElementById(idFor(name))?.focus());
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || !active) return;
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) ?? "");
    const base = { kind, name: value("name"), email: value("email"), phone: value("phone") };
    const content = kind === "quote" ? {
      ...base, audience, city: value("city"), people: value("people").trim() ? Number(value("people")) : undefined,
      date: value("date"), tableware: value("tableware"), privacy: form.get("privacy") === "on", dishIds: props.dishIds,
    } : { ...base, audience: props.audience, message: value("message") };

    const fingerprint = JSON.stringify(content);
    if (!attempt.current || attempt.current.fingerprint !== fingerprint) attempt.current = { fingerprint, id: crypto.randomUUID() };
    const parsed = requestSchema.safeParse({ ...content, requestId: attempt.current.id, startedAt: startedAt.current, website: value("website"), turnstileToken: token });
    if (!parsed.success) {
      const fieldErrors = validationErrors(parsed.error);
      setErrors(fieldErrors); setStatus(copy.validationMessage); focusError(fieldErrors); return;
    }
    setErrors({});
    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !token) { setStatus(copy.verificationRequired); return; }
    submitting.current = true;
    setPending(true); setStatus("");
    try {
      const response = await fetch("/api/aanvragen", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data), signal: AbortSignal.timeout(45000),
      });
      const result: FormResponse = await response.json();
      if (response.ok && result.ok && result.reference) setSuccess(result);
      else {
        setStatus(result.message || copy.networkError);
        if (result.fieldErrors) { setErrors(result.fieldErrors); focusError(result.fieldErrors); }
      }
    } catch { setStatus(copy.networkError); }
    finally { submitting.current = false; setPending(false); setToken(""); setVerificationReset((current) => current + 1); }
  }

  if (success) return <div className="form-panel form-success" ref={successRef} tabIndex={-1} role="status">
    <span className="success-icon"><Check size={26} aria-hidden="true" /></span>
    <h2>{copy.successTitle}</h2>
    <p>{copy.successBody}</p>
    {kind === "quote" && <p>{copy.successQuote}</p>}
    <p>{success.confirmationSent ? copy.confirmationSent : copy.confirmationFailed}</p>
    <p className="request-reference">{copy.referenceLabel}<br /><strong>{success.reference}</strong></p>
    <Link className="button button-primary" href="/">{copy.backHome}<ArrowRight size={16} aria-hidden="true" /></Link>
  </div>;

  return <form className="form-panel request-form" onSubmit={onSubmit} noValidate aria-busy={pending} onChange={(event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    if (errors[target.name]) setErrors((current) => { const next = { ...current }; delete next[target.name]; return next; });
  }}>
    <p className="field-hint required-note">{copy.requiredNote}</p>
    {kind === "quote" && <fieldset className="radio-group audience-options" disabled={pending}>
      <legend>{copy.audienceLabel}</legend>
      {(Object.keys(copy.audiences) as Audience[]).map((option) => <label className="radio-option" key={option}>
        <input type="radio" name="audience" value={option} checked={audience === option} onChange={() => setAudience(option)} />
        <span>{copy.audiences[option]}</span>
      </label>)}
    </fieldset>}

    <fieldset className="form-fields" disabled={pending}>
      <div className="form-grid">
        {field("name", { autocomplete: "name" })}
        {field("email", { type: "email", autocomplete: "email", maxLength: 254 })}
        {field("phone", { type: "tel", autocomplete: "tel", maxLength: 40 })}
        {kind === "quote" ? <>
          {field("city", { autocomplete: "address-level2" })}
          {field("people", { type: "number", min: "1", max: "100000" })}
          {field("date", { type: "date" })}
        </> : field("message", { type: "textarea", full: true })}
      </div>
      {kind === "quote" && <fieldset className="radio-group tableware-options" aria-describedby={errors.tableware ? `${idFor("tableware")}-error` : undefined}>
        <legend>{copy.fields.tableware}<span aria-hidden="true"> *</span></legend>
        {copy.tablewareOptions.map((option, index) => <label className="radio-option" key={option.value}>
          <input id={index === 0 ? idFor("tableware") : `${idFor("tableware")}-${option.value}`} type="radio" name="tableware" value={option.value} required aria-describedby={errors.tableware ? `${idFor("tableware")}-error` : undefined} />
          <span>{option.label}</span>
        </label>)}
        {errors.tableware && <p className="field-error" id={`${idFor("tableware")}-error`}>{errors.tableware}</p>}
      </fieldset>}
    </fieldset>

    <div className="honeypot" aria-hidden="true"><label htmlFor={idFor("website")}>{copy.fields.website}</label><input id={idFor("website")} name="website" tabIndex={-1} autoComplete="off" maxLength={200} /></div>
    {kind === "quote" ? <div className="form-consent">
      <label className="check-label" htmlFor={idFor("privacy")}>
        <input type="checkbox" id={idFor("privacy")} name="privacy" required disabled={pending} aria-invalid={errors.privacy ? true : undefined} aria-describedby={errors.privacy ? `${idFor("privacy")}-error` : undefined} />
        <span>{copy.privacyPrefix} <Link href="/privacy" target="_blank" rel="noopener noreferrer">{copy.privacyLink}</Link> {copy.privacySuffix} *</span>
      </label>
      {errors.privacy && <p className="field-error" id={`${idFor("privacy")}-error`}>{errors.privacy}</p>}
    </div> : <p className="form-privacy-note">{copy.privacyHelp} <Link href="/privacy" target="_blank" rel="noopener noreferrer">{copy.privacyLink}</Link>.</p>}

    {active && <Turnstile onToken={onToken} resetKey={verificationReset} />}
    {status && <div className="form-status form-status-error" role="alert">{status}</div>}
    <div className="quote-actions">
      {kind === "quote" && <button className="button button-secondary" type="button" disabled={pending} onClick={() => { setToken(""); setVerificationReset((current) => current + 1); props.onBack(); }}><ArrowLeft size={17} aria-hidden="true" />{copy.back}</button>}
      <button type="submit" className="button button-primary form-submit" disabled={pending}>
        {pending ? <><LoaderCircle size={18} className="loading-icon" aria-hidden="true" />{copy.submitting}</> : <>{copy.submit}<ArrowRight size={17} aria-hidden="true" /></>}
      </button>
    </div>
    {kind === "quote" && <p className="form-privacy-note">{copy.privacyQuoteHelp}</p>}
  </form>;
}
