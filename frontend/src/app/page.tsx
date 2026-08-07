"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SelectedCountry } from "@/types/map";
import { useTimeSlider } from "@/hooks/useTimeSlider";
import { Header } from "@/components/layout/Header";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { IntroSplash } from "@/components/layout/IntroSplash";
import { DotGlobe, type DotGlobeHandle } from "@/components/map/DotGlobe";
import { MapControls } from "@/components/map/MapControls";
import { TimeSlider } from "@/components/timeline/TimeSlider";
import { CountryPanel } from "@/components/country/CountryPanel";
import { OnThisDay } from "@/components/onthisday/OnThisDay";
import { AIChatBot } from "@/components/chat/AIChatBot";

export default function HomePage() {
  const [selectedCountry, setSelectedCountry] =
    useState<SelectedCountry | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const globeRef = useRef<DotGlobeHandle>(null);
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

  const openSearch = useCallback(() => setSearchOpen(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <DotGlobe
        ref={globeRef}
        onCountrySelect={handleCountrySelect}
        onDeselect={handleClosePanel}
        selectedCountryCode={selectedCountry?.iso_code ?? null}
      />

      <IntroSplash />

      <Header onOpenSearch={openSearch} />

      <CommandPalette
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleSearchSelect}
      />

      <MapControls
        onZoomIn={() => globeRef.current?.zoomIn()}
        onZoomOut={() => globeRef.current?.zoomOut()}
        panelOpen={selectedCountry !== null}
      />

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

      <AIChatBot countryContext={selectedCountry?.name} />
    </div>
  );
}
