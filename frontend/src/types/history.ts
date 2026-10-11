export interface OnThisDayEvent {
  year: number;
  text: string;
  title?: string;
  description?: string;
  wikipedia_url?: string;
  pages?: { title: string; description?: string; thumbnail_url?: string; content_url?: string }[];
}

export type EraKind = "state" | "culture" | "colonial" | "period";

export type EventCategory =
  | "politics"
  | "war"
  | "culture"
  | "religion"
  | "science"
  | "economy"
  | "society"
  | "disaster";

export interface ChronicleEra {
  from_year: number;
  to_year: number;
  kind: EraKind;
  /** Cliopatria polity name when this era is that polity's rule */
  polity: string | null;
  name: string;
  summary: string;
}

export interface ChronicleEvent {
  year: number;
  /** 1 = turning point, 2 = major, 3 = notable */
  importance: 1 | 2 | 3;
  category: EventCategory;
  wikidata_id: string | null;
  title: string;
  description: string;
}

/** History of a modern country's land, 3000 BC–2026, in one language. */
export interface Chronicle {
  iso_code: string;
  eras: ChronicleEra[];
  events: ChronicleEvent[];
}
