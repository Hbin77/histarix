"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

const SEEN_KEY = "histarix_intro_seen";
const LETTERS = ["H", "i", "s", "t", "a", "r", "i", "x"];

/**
 * Cinematic first-load brand reveal: staggered wordmark, tagline, then the
 * whole veil lifts to expose the globe. Shown once per session; skipped
 * entirely under prefers-reduced-motion.
 */
export function IntroSplash() {
  const { t } = useI18n();
  const [phase, setPhase] = useState<"hidden" | "show" | "leave">("hidden");

  useEffect(() => {
    if (sessionStorage.getItem(SEEN_KEY)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sessionStorage.setItem(SEEN_KEY, "1");
      return;
    }
    setPhase("show");
    const leave = setTimeout(() => setPhase("leave"), 2100);
    const done = setTimeout(() => {
      setPhase("hidden");
      sessionStorage.setItem(SEEN_KEY, "1");
    }, 2900);
    return () => {
      clearTimeout(leave);
      clearTimeout(done);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      aria-hidden="true"
      className={`intro-veil fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--surface)] ${
        phase === "leave" ? "intro-veil-leave" : ""
      }`}
    >
      <div className="flex" style={{ fontFamily: "var(--font-headline)" }}>
        {LETTERS.map((ch, i) => (
          <span
            key={i}
            className={`intro-letter text-6xl md:text-7xl font-bold tracking-tight ${
              i >= 6 ? "text-[var(--primary)]" : "text-[var(--on-surface)]"
            }`}
            style={{ animationDelay: `${120 + i * 70}ms` }}
          >
            {ch}
          </span>
        ))}
      </div>
      <p
        className="intro-tagline mt-4 text-sm md:text-base text-[var(--on-surface-variant)]"
        style={{ animationDelay: "900ms" }}
      >
        {t("introTagline")}
      </p>
      <div className="intro-rule mt-6 h-px w-24 bg-[var(--primary)]" style={{ animationDelay: "1050ms" }} />
    </div>
  );
}
