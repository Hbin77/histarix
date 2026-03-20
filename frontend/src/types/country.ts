export interface CountryBasic {
  iso_code: string;
  name: string;
  name_ko?: string;
}

export interface CountryInfo {
  iso_code: string;
  name: string;
  name_ko?: string;
  official_name?: string;
  capital?: string;
  population?: number;
  area?: number;
  region?: string;
  subregion?: string;
  languages?: Record<string, string>;
  currencies?: Record<string, { name: string; symbol: string }>;
  flag_emoji?: string;
  flag_url?: string;
  latlng?: [number, number];
}
