"use client";

import { useState, useEffect } from "react";
import type { CountryInfo } from "@/types/country";
import type { CountryHistory } from "@/types/history";
import { fetchCountryInfo, fetchCountryHistory } from "@/services/countryService";

interface UseCountryDataResult {
  info: CountryInfo | null;
  history: CountryHistory | null;
  loading: boolean;
  error: string | null;
}

export function useCountryData(isoCode: string | null): UseCountryDataResult {
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

    Promise.all([fetchCountryInfo(isoCode), fetchCountryHistory(isoCode)])
      .then(([infoData, historyData]) => {
        if (cancelled) return;
        setInfo(infoData);
        setHistory(historyData);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "데이터를 불러올 수 없습니다.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isoCode]);

  return { info, history, loading, error };
}
