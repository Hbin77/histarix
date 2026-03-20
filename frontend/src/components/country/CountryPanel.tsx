"use client";

import { useState } from "react";
import type { SelectedCountry } from "@/types/map";
import { useCountryData } from "@/hooks/useCountryData";
import { CountryInfo } from "./CountryInfo";
import { CountryHistory } from "./CountryHistory";
import { HistoryTimeline } from "./HistoryTimeline";

interface CountryPanelProps {
  selectedCountry: SelectedCountry | null;
  onClose: () => void;
}

const tabs = [
  { id: "info" as const, label: "정보" },
  { id: "history" as const, label: "역사" },
  { id: "timeline" as const, label: "타임라인" },
];

type TabId = (typeof tabs)[number]["id"];

export function CountryPanel({ selectedCountry, onClose }: CountryPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("info");
  const { info, history, loading, error } = useCountryData(
    selectedCountry?.iso_code ?? null
  );

  const isOpen = selectedCountry !== null;

  return (
    <div
      className={`fixed top-14 right-0 bottom-20 z-40 w-[420px] bg-gray-900/95 backdrop-blur-xl border-l border-white/5 transition-transform duration-300 ease-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <h2 className="text-lg font-semibold text-white">
          {selectedCountry?.name ?? ""}
        </h2>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/10 hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium transition ${
              activeTab === tab.id
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="h-full overflow-y-auto px-5 py-4 pb-24">
        {loading && <PanelSkeleton />}
        {error && (
          <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-400">
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
      <div className="h-8 w-32 rounded bg-white/5" />
      <div className="h-4 w-full rounded bg-white/5" />
      <div className="h-4 w-3/4 rounded bg-white/5" />
      <div className="h-4 w-5/6 rounded bg-white/5" />
      <div className="h-32 w-full rounded-lg bg-white/5" />
      <div className="h-4 w-2/3 rounded bg-white/5" />
      <div className="h-4 w-full rounded bg-white/5" />
    </div>
  );
}
