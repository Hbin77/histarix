"use client";

import { useState, useEffect } from "react";
import type { OnThisDayEvent } from "@/types/history";
import { fetchOnThisDay } from "@/services/onThisDayService";
import { useI18n } from "@/lib/i18n";

interface UseOnThisDayResult {
  events: OnThisDayEvent[];
  loading: boolean;
  error: string | null;
}

export function useOnThisDay(): UseOnThisDayResult {
  const { lang } = useI18n();
  const [events, setEvents] = useState<OnThisDayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchOnThisDay(lang)
      .then((data) => {
        if (!cancelled) setEvents(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lang]);

  return { events, loading, error };
}
