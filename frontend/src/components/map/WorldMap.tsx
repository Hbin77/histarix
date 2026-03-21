"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { SelectedCountry } from "@/types/map";

interface WorldMapProps {
  onCountrySelect: (country: SelectedCountry) => void;
  selectedCountryCode?: string;
  onMapReady?: (map: mapboxgl.Map) => void;
}

export function WorldMap({
  onCountrySelect,
  selectedCountryCode,
  onMapReady,
}: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const hoveredIdRef = useRef<string | null>(null);
  const selectedIdRef = useRef<string | null>(null);
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
      map.addLayer(
        {
          id: "country-fills",
          type: "fill",
          source: "composite",
          "source-layer": "country_boundaries",
          paint: {
            "fill-color": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              "rgba(59,130,246,0.5)",
              ["boolean", ["feature-state", "hover"], false],
              "rgba(59,130,246,0.3)",
              "rgba(59,130,246,0.08)",
            ],
            "fill-outline-color": "rgba(59,130,246,0.4)",
          },
        },
        "admin-0-boundary"
      );

      map.addLayer(
        {
          id: "country-borders",
          type: "line",
          source: "composite",
          "source-layer": "country_boundaries",
          paint: {
            "line-color": "rgba(59,130,246,0.4)",
            "line-width": 0.5,
          },
        },
        "admin-0-boundary"
      );

      onMapReady?.(map);
    });

    map.on("mousemove", "country-fills", (e) => {
      if (!e.features || e.features.length === 0) return;

      if (hoveredIdRef.current !== null) {
        map.setFeatureState(
          {
            source: "composite",
            sourceLayer: "country_boundaries",
            id: hoveredIdRef.current,
          },
          { hover: false }
        );
      }

      const feature = e.features[0];
      hoveredIdRef.current = feature.id as string;

      map.setFeatureState(
        {
          source: "composite",
          sourceLayer: "country_boundaries",
          id: feature.id as string,
        },
        { hover: true }
      );

      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "country-fills", () => {
      if (hoveredIdRef.current !== null) {
        map.setFeatureState(
          {
            source: "composite",
            sourceLayer: "country_boundaries",
            id: hoveredIdRef.current,
          },
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
      const isoCode = props.iso_3166_1;
      const name = props.name_en;

      if (!isoCode) return;

      if (selectedIdRef.current !== null) {
        map.setFeatureState(
          {
            source: "composite",
            sourceLayer: "country_boundaries",
            id: selectedIdRef.current,
          },
          { selected: false }
        );
      }

      selectedIdRef.current = feature.id as string;
      map.setFeatureState(
        {
          source: "composite",
          sourceLayer: "country_boundaries",
          id: feature.id as string,
        },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (
      selectedIdRef.current !== null &&
      selectedIdRef.current !== selectedCountryCode
    ) {
      map.setFeatureState(
        {
          source: "composite",
          sourceLayer: "country_boundaries",
          id: selectedIdRef.current,
        },
        { selected: false }
      );
    }
  }, [selectedCountryCode]);

  if (!hasToken) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#070e1d]">
        <div className="text-center">
          <div className="mb-4 text-6xl">🗺️</div>
          <h2 className="text-xl font-semibold text-[#dfe5fa]">
            Mapbox Token Required
          </h2>
          <p className="mt-2 text-sm text-[#a4abbf]">
            Set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local
          </p>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" />;
}
