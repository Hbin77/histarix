"use client";
import { useI18n, type Lang } from "@/lib/i18n";

const LANGS: { code: Lang; label: string }[] = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "EN" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
];

export function LangSelector() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex items-center gap-1">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`rounded-md px-2 py-1 text-[11px] font-medium transition ${
            lang === l.code
              ? "bg-[#85adff]/20 text-[#85adff]"
              : "text-[#6e7588] hover:text-[#a4abbf]"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
