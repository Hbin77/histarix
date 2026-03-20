import { apiFetch } from "@/lib/api";
import type { OnThisDayEvent } from "@/types/history";

export async function fetchOnThisDay(): Promise<OnThisDayEvent[]> {
  return apiFetch<OnThisDayEvent[]>("/api/on-this-day");
}

export async function fetchOnThisDayByDate(
  month: number,
  day: number
): Promise<OnThisDayEvent[]> {
  return apiFetch<OnThisDayEvent[]>(`/api/on-this-day/${month}/${day}`);
}
