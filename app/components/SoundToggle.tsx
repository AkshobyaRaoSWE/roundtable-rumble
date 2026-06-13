"use client";

import { useSyncExternalStore } from "react";
import { isMuted, setMuted, subscribeMuted } from "@/app/lib/sounds";

export function SoundToggle() {
  // useSyncExternalStore reads the mute flag SSR-safely (server snapshot = false)
  // and re-renders when setMuted() notifies. No setState-in-effect needed.
  const muted = useSyncExternalStore(subscribeMuted, isMuted, () => false);

  return (
    <button
      onClick={() => setMuted(!muted)}
      className="sound-toggle"
      title={muted ? "Sound is off — click to turn on" : "Sound is on — click to mute"}
      aria-label={muted ? "Unmute" : "Mute"}
    >
      <span className="text-[15px]">{muted ? "🔇" : "🔊"}</span>
      <span className="text-[10px] font-bold tracking-[0.2em] uppercase ml-2">
        {muted ? "muted" : "sound"}
      </span>
    </button>
  );
}
