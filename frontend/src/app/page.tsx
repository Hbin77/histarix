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
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);

  const handleCountrySelect = (country: SelectedCountry) => {
    setSelectedCountry(country);
  };

  const handleClosePanel = () => {
    setSelectedCountry(null);
  };

  const handleZoomIn = () => {
    mapInstance?.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    mapInstance?.zoomOut({ duration: 300 });
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <WorldMap
        onCountrySelect={handleCountrySelect}
        selectedCountryCode={selectedCountry?.iso_code}
      />

      <Header />

      <MapControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />

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
