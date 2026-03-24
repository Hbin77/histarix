"use client";

import { useState, useEffect } from "react";
import type { CountryInfo } from "@/types/country";
import type { CountryHistory } from "@/types/history";
import { fetchCountryInfo, fetchCountryHistory } from "@/services/countryService";
import { useI18n } from "@/lib/i18n";

interface UseCountryDataResult {
  info: CountryInfo | null;
  history: CountryHistory | null;
  loading: boolean;
  error: string | null;
}

export function useCountryData(isoCode: string | null): UseCountryDataResult {
  const { lang } = useI18n();
  const [info, setInfo] = useState<CountryInfo | null>(null);
  const [history, setHistory] = useState<CountryHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isoCode) {
      setInfo(null);
      setHistory(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([fetchCountryInfo(isoCode, lang), fetchCountryHistory(isoCode, lang)])
      .then(([infoData, historyData]) => {
        if (cancelled) return;
        setInfo(infoData);
        setHistory(historyData);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isoCode, lang]);

  return { info, history, loading, error };
}
