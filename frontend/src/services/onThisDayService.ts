import { apiFetch } from "@/lib/api";
import type { OnThisDayEvent } from "@/types/history";

interface OnThisDayResponse {
  date?: string;
  selected?: OnThisDayEvent[];
  events?: OnThisDayEvent[];
  births?: OnThisDayEvent[];
  deaths?: OnThisDayEvent[];
}

export async function fetchOnThisDay(): Promise<OnThisDayEvent[]> {
  try {
    const data = await apiFetch<OnThisDayResponse | OnThisDayEvent[]>("/api/onthisday");
    if (Array.isArray(data)) return data;
    return [...(data.selected || []), ...(data.events || [])].slice(0, 20);
  } catch {
    return [];
  }
}

export async function fetchOnThisDayByDate(month: number, day: number): Promise<OnThisDayEvent[]> {
  try {
    const data = await apiFetch<OnThisDayResponse | OnThisDayEvent[]>(`/api/onthisday/${month}/${day}`);
    if (Array.isArray(data)) return data;
    return [...(data.selected || []), ...(data.events || [])].slice(0, 20);
  } catch {
    return [];
  }
}
