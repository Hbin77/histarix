"use client";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function MapControls({ onZoomIn, onZoomOut }: MapControlsProps) {
  return (
    <div className="fixed right-3 md:right-6 bottom-20 md:bottom-28 z-40 flex flex-col gap-1">
      <button
        onClick={onZoomIn}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#070e1d]/60 text-lg text-[#dfe5fa]/70 backdrop-blur-md ring-1 ring-[#414859]/30 transition hover:bg-[#070e1d]/80 hover:text-[#dfe5fa]"
      >
        +
      </button>
      <button
        onClick={onZoomOut}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#070e1d]/60 text-lg text-[#dfe5fa]/70 backdrop-blur-md ring-1 ring-[#414859]/30 transition hover:bg-[#070e1d]/80 hover:text-[#dfe5fa]"
      >
        -
      </button>
    </div>
  );
}
