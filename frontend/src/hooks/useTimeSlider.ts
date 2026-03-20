"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseTimeSliderResult {
  currentYear: number;
  isPlaying: boolean;
  setCurrentYear: (year: number) => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
}

export function useTimeSlider(initialYear = 2000): UseTimeSliderResult {
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentYear((prev) => {
          if (prev >= 2026) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 200);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);

  return { currentYear, isPlaying, setCurrentYear, togglePlay, play, pause };
}
