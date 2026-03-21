export interface CountryBasic {
  iso_code: string;
  name: string;
  flag?: string;
  region?: string;
}

export interface CountryInfo {
  iso_code: string;
  name: string;
  official_name?: string;
  capital?: string[];
  population?: number;
  area?: number;
  region?: string;
  subregion?: string;
  languages?: Record<string, string>;
  currencies?: Record<string, { name: string; symbol: string }>;
  flag?: string;
  coat_of_arms?: string;
  map_url?: string;
  latlng?: number[];
  wikipedia_summary?: string;
  wikipedia_thumbnail?: string;
}
