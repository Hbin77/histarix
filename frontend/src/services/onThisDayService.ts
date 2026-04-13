import { apiFetch } from "@/lib/api";
import type { OnThisDayEvent } from "@/types/history";

interface ApiOnThisDayEvent {
  text: string;
  year: number | null;
  pages?: { title: string; description?: string; thumbnail_url?: string; content_url?: string }[];
}

interface OnThisDayResponse {
  date?: string;
  events?: ApiOnThisDayEvent[];
}

function mapEvent(e: ApiOnThisDayEvent): OnThisDayEvent {
  return {
    year: e.year ?? 0,
    text: e.text,
    title: e.pages?.[0]?.title,
    wikipedia_url: e.pages?.[0]?.content_url || undefined,
    pages: e.pages,
  };
}

export async function fetchOnThisDay(lang: string = "en"): Promise<OnThisDayEvent[]> {
  try {
    const data = await apiFetch<OnThisDayResponse | OnThisDayEvent[]>(`/api/onthisday?lang=${lang}`);
    if (Array.isArray(data)) return data;
    return (data.events || []).map(mapEvent).slice(0, 20);
  } catch {
    return [];
  }
}

export async function fetchOnThisDayByDate(month: number, day: number, lang: string = "en"): Promise<OnThisDayEvent[]> {
  try {
    const data = await apiFetch<OnThisDayResponse | OnThisDayEvent[]>(`/api/onthisday/${month}/${day}?lang=${lang}`);
    if (Array.isArray(data)) return data;
    return (data.events || []).map(mapEvent).slice(0, 20);
  } catch {
    return [];
  }
}
