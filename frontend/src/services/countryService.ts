import { apiFetch } from "@/lib/api";
import type { CountryInfo, CountryBasic } from "@/types/country";
import type { Chronicle } from "@/types/history";

export async function fetchCountryInfo(isoCode: string, lang: string = "en"): Promise<CountryInfo> {
  return apiFetch<CountryInfo>(`/api/countries/${isoCode}?lang=${lang}`);
}

export async function fetchChronicle(isoCode: string, lang: string = "en"): Promise<Chronicle> {
  return apiFetch<Chronicle>(`/api/countries/${isoCode}/chronicle?lang=${lang}`);
}

export async function searchCountries(query: string): Promise<CountryBasic[]> {
  return apiFetch<CountryBasic[]>(
    `/api/countries/search?q=${encodeURIComponent(query)}`
  );
}
