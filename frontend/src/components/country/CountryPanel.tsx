"use client";

import { useEffect, useRef, useState } from "react";
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
const TAB_IDS: TabId[] = ["info", "history", "timeline"];

export function CountryPanel({ selectedCountry, onClose }: CountryPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("info");
  const { t } = useI18n();
  const contentRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: "info" as const, label: t("info") },
    { id: "history" as const, label: t("history") },
    { id: "timeline" as const, label: t("timeline") },
  ];
  const { info, history, loading, error } = useCountryData(
    selectedCountry?.iso_code ?? null
  );

  const isOpen = selectedCountry !== null;

  // fresh selection resets to the info tab and scrolls to top
  useEffect(() => {
    setActiveTab("info");
    contentRef.current?.scrollTo({ top: 0 });
  }, [selectedCountry?.iso_code]);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [activeTab]);

  const tabIndex = TAB_IDS.indexOf(activeTab);

  return (
    <div
      className={`fixed z-40 bg-[var(--surface-container)]/92 shadow-[0_16px_40px_rgba(27,37,64,0.16)] backdrop-blur-xl transition-transform duration-300 ease-out overflow-hidden
        inset-x-0 bottom-0 h-[62vh] rounded-t-3xl border-t border-[var(--outline-variant)]
        lg:inset-x-auto lg:h-auto lg:top-20 lg:right-3 lg:bottom-24 lg:w-[420px] lg:rounded-3xl lg:border lg:border-[var(--outline-variant)]
        ${isOpen
          ? "translate-y-0 lg:translate-y-0 lg:translate-x-0 lg:opacity-100"
          : "translate-y-full lg:translate-y-0 lg:translate-x-[calc(100%+1rem)] lg:opacity-0"
        }`}
    >
      {/* Mobile drag handle */}
      <div className="flex justify-center py-2 lg:hidden">
        <div className="h-1 w-10 rounded-full bg-[var(--outline)]" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 pb-3 pt-4">
        <h2
          key={selectedCountry?.iso_code ?? "none"}
          className="rise-in text-xl font-bold tracking-tight text-[var(--on-surface)]"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          {selectedCountry?.name ?? ""}
        </h2>
        <button
          onClick={onClose}
          aria-label={t("backToMap")}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>
      </div>

      {/* Tabs: pill track with sliding indicator */}
      <div className="mx-5 mb-1 rounded-xl bg-[var(--surface-container-high)]/70 p-1">
        <div className="relative grid grid-cols-3">
          <div
            aria-hidden="true"
            className="absolute inset-y-0 w-1/3 rounded-lg bg-[var(--surface-container-low)] shadow-[0_2px_8px_rgba(27,37,64,0.10)] ring-1 ring-[var(--outline-variant)]/60 transition-transform duration-300 ease-out"
            style={{ transform: `translateX(${tabIndex * 100}%)` }}
          />
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative z-10 min-h-10 rounded-lg py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-[var(--primary)]"
                  : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="h-full overflow-y-auto px-5 py-4 pb-28 text-[var(--on-surface)]">
        {loading && <PanelSkeleton />}
        {error && (
          <div className="rounded-xl bg-[var(--error)]/10 p-4 text-sm text-[var(--error)]">
            {error}
          </div>
        )}
        {!loading && !error && (
          <div key={`${selectedCountry?.iso_code}-${activeTab}`} className="stagger">
            {activeTab === "info" && <CountryInfo info={info} />}
            {activeTab === "history" && <CountryHistory history={history} />}
            {activeTab === "timeline" && (
              <HistoryTimeline events={history?.events ?? []} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-32 rounded-lg bg-[var(--surface-container-high)]" />
      <div className="h-4 w-full rounded bg-[var(--surface-container-high)]" />
      <div className="h-4 w-3/4 rounded bg-[var(--surface-container-high)]" />
      <div className="h-4 w-5/6 rounded bg-[var(--surface-container-high)]" />
      <div className="h-32 w-full rounded-xl bg-[var(--surface-container-high)]" />
      <div className="h-4 w-2/3 rounded bg-[var(--surface-container-high)]" />
      <div className="h-4 w-full rounded bg-[var(--surface-container-high)]" />
    </div>
  );
}
