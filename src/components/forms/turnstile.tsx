"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { formsContent as copy } from "@/src/lib/content";

interface TurnstileApi {
  render(container: HTMLElement, options: {
    sitekey: string; action: string; language: string; theme: string; size: string;
    callback: (token: string) => void;
    "expired-callback": () => void;
    "error-callback": () => void;
  }): string;
  remove(widgetId: string): void;
}

declare global { interface Window { turnstile?: TurnstileApi } }

export function Turnstile({ onToken, resetKey }: { onToken: (token: string) => void; resetKey: number }) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!ready || !siteKey || !container.current || !window.turnstile) return;
    const api = window.turnstile;
    const widgetId = api.render(container.current, {
      sitekey: siteKey, action: "catering_request", language: "nl", theme: "light", size: "flexible",
      callback: (token) => { setError(""); onToken(token); },
      "expired-callback": () => { onToken(""); setError(copy.verificationExpired); },
      "error-callback": () => { onToken(""); setError(copy.verificationError); },
    });
    return () => api.remove(widgetId);
  }, [ready, siteKey, onToken, resetKey]);

  if (!siteKey) return null;
  return <div className="turnstile-field">
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={() => setReady(true)} onError={() => setError(copy.verificationError)} />
    <div ref={container} />
    {error && <p className="field-error" role="alert">{error}</p>}
  </div>;
}
