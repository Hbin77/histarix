"use client";

import { useState } from "react";
import type { SelectedCountry } from "@/types/map";
import { useCountryData } from "@/hooks/useCountryData";
import { useI18n } from "@/lib/i18n";
import { CountryInfo } from "./CountryInfo";
import { CountryHistory } from "./CountryHistory";
import { HistoryTimeline } from "./HistoryTimeline";

interface CountryPanelProps {
  selectedCountry: SelectedCountry | null;
  onClose: () => void;
}

type TabId = "info" | "history" | "timeline";

export function CountryPanel({ selectedCountry, onClose }: CountryPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("info");
  const { t } = useI18n();

  const tabs = [
    { id: "info" as const, label: t("info") },
    { id: "history" as const, label: t("history") },
    { id: "timeline" as const, label: t("timeline") },
  ];
  const { info, history, loading, error } = useCountryData(
    selectedCountry?.iso_code ?? null
  );

  const isOpen = selectedCountry !== null;

  return (
    <div
      className={`fixed z-40 border-t border-[var(--outline-variant)] bg-[var(--surface-container)]/90 shadow-[0_16px_40px_rgba(27,37,64,0.16)] backdrop-blur-xl transition-transform duration-300 ease-out overflow-hidden
        inset-x-0 bottom-0 h-[60vh] rounded-t-2xl
        lg:inset-x-auto lg:h-auto lg:top-14 lg:right-0 lg:bottom-20 lg:w-[420px] lg:rounded-none lg:border-t-0 lg:border-l
        ${isOpen
          ? "translate-y-0 lg:translate-y-0 lg:translate-x-0"
          : "translate-y-full lg:translate-y-0 lg:translate-x-full"
        }`}
    >
      {/* Mobile drag handle */}
      <div className="flex justify-center py-2 lg:hidden">
        <div className="h-1 w-10 rounded-full bg-[var(--outline)]" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--outline-variant)] px-5 py-4">
        <h2 className="text-lg font-semibold text-[var(--on-surface)]">
          {selectedCountry?.name ?? ""}
        </h2>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--outline-variant)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium transition ${
              activeTab === tab.id
                ? "text-[var(--primary)] border-b-2 border-[var(--primary)]"
                : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="h-full overflow-y-auto px-5 py-4 pb-24 text-[var(--on-surface)]">
        {loading && <PanelSkeleton />}
        {error && (
          <div className="rounded-lg bg-[var(--error)]/10 p-4 text-sm text-[var(--error)]">
            {error}
          </div>
        )}
        {!loading && !error && (
          <>
            {activeTab === "info" && <CountryInfo info={info} />}
            {activeTab === "history" && <CountryHistory history={history} />}
            {activeTab === "timeline" && (
              <HistoryTimeline events={history?.events ?? []} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-32 rounded bg-[var(--surface-container-high)]" />
      <div className="h-4 w-full rounded bg-[var(--surface-container-high)]" />
      <div className="h-4 w-3/4 rounded bg-[var(--surface-container-high)]" />
      <div className="h-4 w-5/6 rounded bg-[var(--surface-container-high)]" />
      <div className="h-32 w-full rounded-lg bg-[var(--surface-container-high)]" />
      <div className="h-4 w-2/3 rounded bg-[var(--surface-container-high)]" />
      <div className="h-4 w-full rounded bg-[var(--surface-container-high)]" />
    </div>
  );
}
