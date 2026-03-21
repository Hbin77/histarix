import { apiFetch } from "@/lib/api";
import type { OnThisDayEvent } from "@/types/history";

export async function fetchOnThisDay(): Promise<OnThisDayEvent[]> {
  return apiFetch<OnThisDayEvent[]>("/api/onthisday");
}

export async function fetchOnThisDayByDate(
  month: number,
  day: number
): Promise<OnThisDayEvent[]> {
  return apiFetch<OnThisDayEvent[]>(`/api/onthisday/${month}/${day}`);
}
