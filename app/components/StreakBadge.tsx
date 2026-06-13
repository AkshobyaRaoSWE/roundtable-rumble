"use client";

import { useSyncExternalStore } from "react";
import { loadStreak, ZERO, type StreakData } from "@/app/lib/streak";

// Floating top-left badge showing your current run. Reads the streak from
// localStorage via useSyncExternalStore: it re-checks on window focus, on
// cross-tab storage events, and on a short poll so in-app updates show up.

// Cache the snapshot so an unchanged streak returns the same object reference
// (useSyncExternalStore compares with Object.is).
let cache: { key: string; value: StreakData } = { key: "", value: ZERO };

function snapshot(): StreakData {
  const s = loadStreak();
  const key = `${s.current}|${s.best}|${s.total}|${s.wins}`;
  if (cache.key === key) return cache.value;
  cache = { key, value: s };
  return s;
}

function subscribe(cb: () => void): () => void {
  window.addEventListener("focus", cb);
  window.addEventListener("storage", cb);
  const id = window.setInterval(cb, 800);
  return () => {
    window.removeEventListener("focus", cb);
    window.removeEventListener("storage", cb);
    window.clearInterval(id);
  };
}

export function StreakBadge() {
  const s = useSyncExternalStore(subscribe, snapshot, () => ZERO);

  return (
    <div className="streak-badge" title="Your current correct-pick streak">
      <div className="flex items-baseline gap-2">
        <span className="text-[18px] leading-none">🔥</span>
        <span className="font-display italic text-[26px] leading-none mono">
          {s.current}
        </span>
        <span className="text-[10px] tracking-[0.18em] uppercase font-bold ml-1 text-[var(--ink-3)]">
          streak
        </span>
      </div>
      {(s.best > 0 || s.total > 0) && (
        <div className="text-[10px] tracking-[0.18em] uppercase text-[var(--ink-3)] mt-1 mono">
          best {s.best} &middot; {s.wins}/{s.total}
        </div>
      )}
    </div>
  );
}
