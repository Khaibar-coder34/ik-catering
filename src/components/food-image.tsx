"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import site from "@/src/data/site.json";

export function FoodImage({ src, alt, className = "", ...props }: Omit<ImageProps, "src"> & { src?: string }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  if (!src || failedSource === src) {
    return <div className={`image-fallback ${className}`} role="img" aria-label={alt || site.ui.imageFallback}>
      <UtensilsCrossed size={34} strokeWidth={1} aria-hidden="true" />
      <span>{site.ui.imageFallback}</span>
    </div>;
  }
  return <Image {...props} src={src} alt={alt} className={className} onError={() => setFailedSource(src)} />;
}
