import { useEffect, useState } from 'react';

import type { GoogleFontSettings } from '../domain/typography.types';
import { createGoogleFontUrl } from './google-font-url';

export type FontLoadStatus = 'idle' | 'loading' | 'loaded' | 'failed' | 'offline';

export function usePreviewFont(font?: GoogleFontSettings): FontLoadStatus {
  const [status, setStatus] = useState<FontLoadStatus>(font ? 'loading' : 'idle');

  useEffect(() => {
    if (!font) return;
    if (!navigator.onLine) {
      queueMicrotask(() => setStatus('offline'));
      return;
    }

    const href = createGoogleFontUrl(font);
    const existing = document.querySelector<HTMLLinkElement>(`link[data-preview-font="active"]`);
    if (existing?.href === href) {
      queueMicrotask(() => setStatus('loaded'));
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.previewFont = 'candidate';
    queueMicrotask(() => setStatus('loading'));

    const timeout = window.setTimeout(() => {
      setStatus('failed');
      link.remove();
    }, 8000);

    link.onload = () => {
      window.clearTimeout(timeout);
      existing?.remove();
      link.dataset.previewFont = 'active';
      setStatus('loaded');
    };
    link.onerror = () => {
      window.clearTimeout(timeout);
      link.remove();
      setStatus('failed');
    };
    document.head.append(link);

    return () => {
      window.clearTimeout(timeout);
      if (link.dataset.previewFont === 'candidate') link.remove();
    };
  }, [font]);

  return status;
}
