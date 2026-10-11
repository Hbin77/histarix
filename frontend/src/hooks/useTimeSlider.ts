"use client";

import { useState, useCallback, useEffect } from "react";
import { MAX_YEAR, MIN_YEAR, clampYear, posToYear, yearToPos } from "@/lib/years";

interface UseTimeSliderResult {
  currentYear: number;
  isPlaying: boolean;
  setCurrentYear: (year: number) => void;
  togglePlay: () => void;
}

const TICK_MS = 120;
/** track fraction per tick — a full sweep takes ~48 s */
const PLAY_STEP = 1 / 400;

export function useTimeSlider(initialYear = MAX_YEAR): UseTimeSliderResult {
  const [currentYear, setYear] = useState(initialYear);
  const [isPlaying, setIsPlaying] = useState(false);

  const setCurrentYear = useCallback((year: number) => {
    setYear(clampYear(year));
  }, []);

  const togglePlay = useCallback(() => {
    // replay from the start when pressed at the end of the track
    if (!isPlaying && currentYear >= MAX_YEAR) setYear(MIN_YEAR);
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentYear]);

  // play advances along the track (not by years), so every era passes at
  // the pace the slider gives it
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setYear((prev) => {
        const next = Math.max(prev + 1, posToYear(yearToPos(prev) + PLAY_STEP));
        return clampYear(next);
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying && currentYear >= MAX_YEAR) setIsPlaying(false);
  }, [isPlaying, currentYear]);

  return { currentYear, isPlaying, setCurrentYear, togglePlay };
}
