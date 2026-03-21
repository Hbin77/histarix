export interface RelatedPage {
  title: string;
  url: string;
}

export interface HistoricalEvent {
  label: string;
  date?: string;
  year?: number;
  description: string;
  wikidata_id?: string;
  wikipedia_url?: string;
  image_url?: string;
  category?: string;
  title?: string;
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
  country_name: string;
  iso_code: string;
  summary?: string;
  wikipedia_url?: string;
  events: HistoricalEvent[];
}
