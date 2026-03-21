"use client";

import type { CountryInfo as CountryInfoType } from "@/types/country";

interface CountryInfoProps {
  info: CountryInfoType | null;
}

export function CountryInfo({ info }: CountryInfoProps) {
  if (!info) {
    return (
      <p className="text-sm text-[#6e7588]">국가 정보를 불러올 수 없습니다.</p>
    );
  }

  const fields: { label: string; value: string | undefined; icon: React.ReactNode }[] = [
    {
      label: "수도",
      value: info.capital?.join(", "),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
      ),
    },
    {
      label: "인구",
      value: info.population?.toLocaleString(),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      label: "면적",
      value: info.area ? `${info.area.toLocaleString()} km²` : undefined,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
        </svg>
      ),
    },
    {
      label: "지역",
      value: info.region,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      ),
    },
    {
      label: "소지역",
      value: info.subregion,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      ),
    },
    {
      label: "언어",
      value: info.languages
        ? Object.values(info.languages).join(", ")
        : undefined,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 8l6 10"/><path d="M4 14h8"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/>
        </svg>
      ),
    },
    {
      label: "통화",
      value: info.currencies
        ? Object.values(info.currencies)
            .map((c) => `${c.name} (${c.symbol})`)
            .join(", ")
        : undefined,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Hero banner with flag */}
      {info.flag && (
        <div className="relative -mx-5 -mt-4 mb-6 h-32 overflow-hidden rounded-t-lg">
          <img
            src={info.flag}
            alt={info.name}
            className="h-full w-full object-cover opacity-30 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1323] to-transparent" />
          <div className="absolute bottom-4 left-5 flex items-center gap-3">
            <img src={info.flag} alt="" className="h-8 w-auto rounded shadow" />
            <div>
              <h3 className="text-xl font-bold text-[#dfe5fa]">{info.name}</h3>
              {info.official_name && (
                <p className="text-xs text-[#a4abbf]">{info.official_name}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fallback header when no flag */}
      {!info.flag && (
        <div>
          <h3 className="text-xl font-bold text-[#dfe5fa]">{info.name}</h3>
          {info.official_name && (
            <p className="text-sm text-[#6e7588]">{info.official_name}</p>
          )}
          <p className="text-xs font-mono text-[#dfe5fa]/30">{info.iso_code}</p>
        </div>
      )}

      {/* Info Fields */}
      <div className="space-y-2">
        {fields.map(
          (field) =>
            field.value && (
              <div
                key={field.label}
                className="flex items-center gap-3 rounded-lg bg-[#1b263b]/30 px-4 py-3"
              >
                <div className="shrink-0 text-[#6e7588]">
                  {field.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-[#6e7588] block">{field.label}</span>
                  <span className="text-sm font-medium text-[#dfe5fa] block truncate">
                    {field.value}
                  </span>
                </div>
              </div>
            )
        )}
      </div>

      {info.wikipedia_summary && (
        <div className="mt-4 rounded-xl bg-gradient-to-br from-[#161f33] to-[#0b1323] p-5">
          <p className="text-sm leading-relaxed text-[#a4abbf]">{info.wikipedia_summary}</p>
        </div>
      )}
    </div>
  );
}
