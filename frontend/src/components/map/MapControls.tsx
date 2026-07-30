"use client";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  /** shifts the controls clear of the desktop country panel */
  panelOpen?: boolean;
}

export function MapControls({ onZoomIn, onZoomOut, panelOpen }: MapControlsProps) {
  return (
    <div
      className={`fixed right-3 md:right-6 bottom-20 md:bottom-28 z-40 flex flex-col gap-2 transition-[right] duration-300 ${
        panelOpen ? "lg:right-[444px]" : ""
      }`}
    >
      <button
        onClick={onZoomIn}
        aria-label="Zoom in"
        className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--surface)]/60 text-[var(--on-surface)]/70 backdrop-blur-md ring-1 ring-[var(--outline-variant)]/30 transition hover:bg-[var(--surface)]/80 hover:text-[var(--on-surface)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
      </button>
      <button
        onClick={onZoomOut}
        aria-label="Zoom out"
        className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--surface)]/60 text-[var(--on-surface)]/70 backdrop-blur-md ring-1 ring-[var(--outline-variant)]/30 transition hover:bg-[var(--surface)]/80 hover:text-[var(--on-surface)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14"/></svg>
      </button>
    </div>
  );
}
