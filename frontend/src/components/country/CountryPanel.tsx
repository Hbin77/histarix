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
      className={`fixed top-14 right-0 bottom-20 z-40 w-[420px] bg-[#0b1323]/95 backdrop-blur-xl transition-transform duration-300 ease-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#414859] px-5 py-4">
        <h2 className="text-lg font-semibold text-[#dfe5fa]">
          {selectedCountry?.name ?? ""}
        </h2>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a4abbf] transition hover:bg-[#161f33] hover:text-[#dfe5fa]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#414859]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium transition ${
              activeTab === tab.id
                ? "text-[#85adff] border-b-2 border-[#85adff]"
                : "text-[#a4abbf] hover:text-[#dfe5fa]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="h-full overflow-y-auto px-5 py-4 pb-24 text-[#dfe5fa]">
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
      <div className="h-8 w-32 rounded bg-[#161f33]" />
      <div className="h-4 w-full rounded bg-[#161f33]" />
      <div className="h-4 w-3/4 rounded bg-[#161f33]" />
      <div className="h-4 w-5/6 rounded bg-[#161f33]" />
      <div className="h-32 w-full rounded-lg bg-[#161f33]" />
      <div className="h-4 w-2/3 rounded bg-[#161f33]" />
      <div className="h-4 w-full rounded bg-[#161f33]" />
    </div>
  );
}
