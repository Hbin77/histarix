export interface RelatedPage {
  title: string;
  url: string;
}

export interface HistoricalEvent {
  year: number;
  title: string;
  description: string;
  category?: string;
  related_pages?: RelatedPage[];
}

export interface OnThisDayEvent {
  year: number;
  title: string;
  description: string;
  wikipedia_url?: string;
  related_pages?: RelatedPage[];
}

export interface CountryHistory {
  iso_code: string;
  summary?: string;
  wikipedia_url?: string;
  events: HistoricalEvent[];
}
