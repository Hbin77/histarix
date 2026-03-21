"use client";

import { useEffect } from "react";
import { initPostHog } from "@/lib/posthog";
import { I18nProvider } from "@/lib/i18n";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  return <I18nProvider>{children}</I18nProvider>;
}
