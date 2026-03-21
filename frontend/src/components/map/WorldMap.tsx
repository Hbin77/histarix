"use client";

import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { SelectedCountry } from "@/types/map";
import { COUNTRY_LANDMARKS } from "@/data/landmarks";

interface WorldMapProps {
  onCountrySelect: (country: SelectedCountry) => void;
  selectedCountryCode?: string;
}

export function WorldMap({
  onCountrySelect,
  selectedCountryCode,
}: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const markerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedIsoRef = useRef<string | null>(null);
  const hoveredIdRef = useRef<number | null>(null);
  const selectedIdRef = useRef<number | null>(null);
  const onCountrySelectRef = useRef(onCountrySelect);
  const [hasToken, setHasToken] = useState(true);
  const [isImmersive, setIsImmersive] = useState(false);

  useEffect(() => {
    onCountrySelectRef.current = onCountrySelect;
  }, [onCountrySelect]);

  const resetView = () => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center: [15, 30], zoom: 2, pitch: 0, bearing: 0, duration: 1500 });
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    setIsImmersive(false);
  };

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) { setHasToken(false); return; }
    if (!containerRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [15, 30],
      zoom: 2,
      pitch: 0,
      bearing: 0,
      projection: "mercator",
    });

    mapRef.current = map;

    map.on("load", () => {
      map.addSource("country-boundaries", {
        type: "vector",
        url: "mapbox://mapbox.country-boundaries-v1",
      });

      map.addLayer({
        id: "country-fills",
        type: "fill",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        paint: {
          "fill-color": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            "rgba(133,173,255,0.5)",
            ["boolean", ["feature-state", "hover"], false],
            "rgba(133,173,255,0.25)",
            "rgba(133,173,255,0.06)",
          ],
        },
      });

      map.addLayer({
        id: "country-borders",
        type: "line",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        paint: {
          "line-color": "rgba(133,173,255,0.3)",
          "line-width": 0.5,
        },
      });
    });

    map.on("mousemove", "country-fills", (e) => {
      if (!e.features || e.features.length === 0) return;
      const feature = e.features[0];
      const id = feature.id as number;
      if (hoveredIdRef.current !== null && hoveredIdRef.current !== id) {
        map.setFeatureState(
          { source: "country-boundaries", sourceLayer: "country_boundaries", id: hoveredIdRef.current },
          { hover: false }
        );
      }
      hoveredIdRef.current = id;
      map.setFeatureState(
        { source: "country-boundaries", sourceLayer: "country_boundaries", id },
        { hover: true }
      );
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "country-fills", () => {
      if (hoveredIdRef.current !== null) {
        map.setFeatureState(
          { source: "country-boundaries", sourceLayer: "country_boundaries", id: hoveredIdRef.current },
          { hover: false }
        );
      }
      hoveredIdRef.current = null;
      map.getCanvas().style.cursor = "";
    });

    map.on("click", "country-fills", (e) => {
      if (!e.features || e.features.length === 0) return;
      const feature = e.features[0];
      const props = feature.properties as Record<string, string>;
      const isoCode = props.iso_3166_1 || props.iso_3166_1_alpha_2;
      const name = props.name_en || props.name;
      if (!isoCode) return;

      // Clear any pending marker timer
      if (markerTimerRef.current) {
        clearTimeout(markerTimerRef.current);
        markerTimerRef.current = null;
      }

      // Remove existing marker immediately
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }

      // Toggle: same country clicked again → deselect & zoom out
      if (selectedIsoRef.current === isoCode) {
        if (selectedIdRef.current !== null) {
          map.setFeatureState(
            { source: "country-boundaries", sourceLayer: "country_boundaries", id: selectedIdRef.current },
            { selected: false }
          );
        }
        selectedIsoRef.current = null;
        selectedIdRef.current = null;
        map.flyTo({ center: [15, 30], zoom: 2, pitch: 0, bearing: 0, duration: 1500 });
        setIsImmersive(false);
        return;
      }

      // Deselect previous
      if (selectedIdRef.current !== null) {
        map.setFeatureState(
          { source: "country-boundaries", sourceLayer: "country_boundaries", id: selectedIdRef.current },
          { selected: false }
        );
      }

      const id = feature.id as number;
      selectedIdRef.current = id;
      selectedIsoRef.current = isoCode;
      map.setFeatureState(
        { source: "country-boundaries", sourceLayer: "country_boundaries", id },
        { selected: true }
      );

      onCountrySelectRef.current({
        iso_code: isoCode,
        name: name ?? isoCode,
        center: [e.lngLat.lng, e.lngLat.lat],
      });

      const landmark = COUNTRY_LANDMARKS[isoCode];

      // Fly to country with tilt
      map.flyTo({
        center: [e.lngLat.lng, e.lngLat.lat],
        zoom: 5,
        pitch: 50,
        bearing: -10,
        duration: 2000,
        essential: true,
      });
      setIsImmersive(true);

      if (landmark) {
        markerTimerRef.current = setTimeout(() => {
          if (!mapRef.current) return;

          const el = document.createElement("div");
          el.className = "landmark-marker";
          el.innerHTML = `
            <div class="landmark-monument">
              <img src="${landmark.image}" alt="${landmark.name}" class="landmark-img" />
            </div>
            <div class="landmark-base">
              <div class="landmark-base-glow"></div>
            </div>
            <div class="landmark-info-card">
              <div class="landmark-name">${landmark.name}</div>
              <div class="landmark-tagline">${landmark.tagline}</div>
            </div>
          `;

          const marker = new mapboxgl.Marker({
            element: el,
            anchor: "bottom",
          })
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .addTo(mapRef.current!);

          markerRef.current = marker;
          markerTimerRef.current = null;
        }, 1800);
      }
    });

    return () => {
      if (markerTimerRef.current) clearTimeout(markerTimerRef.current);
      if (markerRef.current) markerRef.current.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || selectedIdRef.current === null) return;
    map.setFeatureState(
      { source: "country-boundaries", sourceLayer: "country_boundaries", id: selectedIdRef.current },
      { selected: false }
    );
  }, [selectedCountryCode]);

  if (!hasToken) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#070e1d]">
        <div className="text-center">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#85adff" strokeWidth="1.5" className="mb-4 mx-auto"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <h2 className="text-xl font-semibold text-[#dfe5fa]">Mapbox 토큰을 설정해주세요</h2>
          <p className="mt-2 text-sm text-[#a4abbf]">NEXT_PUBLIC_MAPBOX_TOKEN in .env.local</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {isImmersive && (
        <button
          onClick={resetView}
          className="absolute top-20 left-6 z-30 flex items-center gap-2 rounded-xl bg-[#11192b]/90 px-4 py-2.5 text-sm font-medium text-[#dfe5fa] backdrop-blur-xl transition hover:bg-[#1b263b] border border-[#414859]/30"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          세계 지도로 돌아가기
        </button>
      )}
    </div>
  );
}
