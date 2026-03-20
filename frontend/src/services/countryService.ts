import { apiFetch } from "@/lib/api";
import type { CountryInfo, CountryBasic } from "@/types/country";
import type { CountryHistory } from "@/types/history";

export async function fetchCountryInfo(isoCode: string): Promise<CountryInfo> {
  return apiFetch<CountryInfo>(`/api/countries/${isoCode}`);
}

export async function fetchCountryHistory(
  isoCode: string
): Promise<CountryHistory> {
  return apiFetch<CountryHistory>(`/api/countries/${isoCode}/history`);
}

export async function searchCountries(query: string): Promise<CountryBasic[]> {
  return apiFetch<CountryBasic[]>(
    `/api/countries/search?q=${encodeURIComponent(query)}`
  );
}
