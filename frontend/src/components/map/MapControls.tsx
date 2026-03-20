"use client";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function MapControls({ onZoomIn, onZoomOut }: MapControlsProps) {
  return (
    <div className="fixed right-6 bottom-28 z-40 flex flex-col gap-1">
      <button
        onClick={onZoomIn}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/50 text-lg text-white/70 backdrop-blur-md ring-1 ring-white/10 transition hover:bg-black/70 hover:text-white"
      >
        +
      </button>
      <button
        onClick={onZoomOut}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/50 text-lg text-white/70 backdrop-blur-md ring-1 ring-white/10 transition hover:bg-black/70 hover:text-white"
      >
        -
      </button>
    </div>
  );
}
