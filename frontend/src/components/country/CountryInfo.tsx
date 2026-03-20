"use client";

import type { CountryInfo as CountryInfoType } from "@/types/country";

interface CountryInfoProps {
  info: CountryInfoType | null;
}

export function CountryInfo({ info }: CountryInfoProps) {
  if (!info) {
    return (
      <p className="text-sm text-white/40">국가 정보를 불러올 수 없습니다.</p>
    );
  }

  const fields: { label: string; value: string | undefined }[] = [
    { label: "수도", value: info.capital },
    {
      label: "인구",
      value: info.population?.toLocaleString(),
    },
    {
      label: "면적",
      value: info.area ? `${info.area.toLocaleString()} km²` : undefined,
    },
    { label: "지역", value: info.region },
    { label: "소지역", value: info.subregion },
    {
      label: "언어",
      value: info.languages
        ? Object.values(info.languages).join(", ")
        : undefined,
    },
    {
      label: "통화",
      value: info.currencies
        ? Object.values(info.currencies)
            .map((c) => `${c.name} (${c.symbol})`)
            .join(", ")
        : undefined,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Flag + Name */}
      <div className="flex items-center gap-4">
        {info.flag_emoji && (
          <span className="text-5xl">{info.flag_emoji}</span>
        )}
        <div>
          <h3 className="text-xl font-bold text-white">
            {info.name_ko ?? info.name}
          </h3>
          {info.official_name && (
            <p className="text-sm text-white/40">{info.official_name}</p>
          )}
          <p className="text-xs font-mono text-white/30">{info.iso_code}</p>
        </div>
      </div>

      {/* Info Fields */}
      <div className="space-y-3">
        {fields.map(
          (field) =>
            field.value && (
              <div
                key={field.label}
                className="flex items-start justify-between rounded-lg bg-white/5 px-4 py-3"
              >
                <span className="text-sm text-white/40">{field.label}</span>
                <span className="text-sm font-medium text-white/80 text-right max-w-[220px]">
                  {field.value}
                </span>
              </div>
            )
        )}
      </div>
    </div>
  );
}
