"use client";

import { useState } from "react";
import type { SelectedCountry } from "@/types/map";
import { useTimeSlider } from "@/hooks/useTimeSlider";
import { Header } from "@/components/layout/Header";
import { WorldMap } from "@/components/map/WorldMap";
import { MapControls } from "@/components/map/MapControls";
import { TimeSlider } from "@/components/timeline/TimeSlider";
import { CountryPanel } from "@/components/country/CountryPanel";
import { OnThisDay } from "@/components/onthisday/OnThisDay";

export default function HomePage() {
  const [selectedCountry, setSelectedCountry] =
    useState<SelectedCountry | null>(null);
  const { currentYear, isPlaying, setCurrentYear, togglePlay } =
    useTimeSlider(2000);
  const handleCountrySelect = (country: SelectedCountry) => {
    setSelectedCountry(country);
  };

  const handleSearchSelect = (country: { iso_code: string; name: string }) => {
    setSelectedCountry({
      iso_code: country.iso_code,
      name: country.name,
      center: [0, 0],
    });
  };

  const handleClosePanel = () => {
    setSelectedCountry(null);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <WorldMap
        onCountrySelect={handleCountrySelect}
        selectedCountryCode={selectedCountry?.iso_code}
      />

      <Header onCountrySelect={handleSearchSelect} />

      <MapControls onZoomIn={() => {}} onZoomOut={() => {}} />

      <CountryPanel
        selectedCountry={selectedCountry}
        onClose={handleClosePanel}
      />

      <TimeSlider
        currentYear={currentYear}
        isPlaying={isPlaying}
        onYearChange={setCurrentYear}
        onTogglePlay={togglePlay}
      />

      <OnThisDay />
    </div>
  );
}
