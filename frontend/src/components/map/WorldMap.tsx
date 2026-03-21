"use client";

import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { SelectedCountry } from "@/types/map";

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
  const hoveredIdRef = useRef<number | null>(null);
  const selectedIdRef = useRef<number | null>(null);
  const onCountrySelectRef = useRef(onCountrySelect);
  const [hasToken, setHasToken] = useState(true);

  useEffect(() => {
    onCountrySelectRef.current = onCountrySelect;
  }, [onCountrySelect]);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      setHasToken(false);
      return;
    }
    if (!containerRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [15, 30],
      zoom: 2,
      projection: "mercator",
    });

    mapRef.current = map;

    map.on("load", () => {
      // Add country boundaries vector source
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

      if (selectedIdRef.current !== null) {
        map.setFeatureState(
          { source: "country-boundaries", sourceLayer: "country_boundaries", id: selectedIdRef.current },
          { selected: false }
        );
      }

      const id = feature.id as number;
      selectedIdRef.current = id;
      map.setFeatureState(
        { source: "country-boundaries", sourceLayer: "country_boundaries", id },
        { selected: true }
      );

      onCountrySelectRef.current({
        iso_code: isoCode,
        name: name ?? isoCode,
        center: [e.lngLat.lng, e.lngLat.lat],
      });
    });

    return () => {
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
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#85adff" strokeWidth="1.5" className="mb-4"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <h2 className="text-xl font-semibold text-[#dfe5fa]">Mapbox 토큰을 설정해주세요</h2>
          <p className="mt-2 text-sm text-[#a4abbf]">NEXT_PUBLIC_MAPBOX_TOKEN in .env.local</p>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" />;
}
