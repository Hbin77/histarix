"use client";

import { useState, useEffect } from "react";
import type { CountryInfo } from "@/types/country";
import type { Chronicle } from "@/types/history";
import { fetchCountryInfo, fetchChronicle } from "@/services/countryService";
import { useI18n } from "@/lib/i18n";

interface Loadable<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

const idle = { data: null, loading: false, error: null };

/** Fetch per country + language; each source loads and fails independently. */
function useCountryResource<T>(
  isoCode: string | null,
  fetcher: (iso: string, lang: string) => Promise<T>
): Loadable<T> {
  const { lang } = useI18n();
  const [state, setState] = useState<Loadable<T>>(idle);

  useEffect(() => {
    if (!isoCode) {
      setState(idle);
      return;
    }
    let cancelled = false;
    setState({ data: null, loading: true, error: null });
    fetcher(isoCode, lang)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        const error = err instanceof Error ? err.message : "Failed to load data";
        setState({ data: null, loading: false, error });
      });
    return () => {
      cancelled = true;
    };
  }, [isoCode, lang, fetcher]);

  return state;
}

export function useCountryInfo(isoCode: string | null) {
  return useCountryResource<CountryInfo>(isoCode, fetchCountryInfo);
}

export function useChronicle(isoCode: string | null) {
  return useCountryResource<Chronicle>(isoCode, fetchChronicle);
}
