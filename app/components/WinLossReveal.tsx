"use client";

import type { StreakData } from "@/app/lib/streak";

// Big animated win/loss reveal. Drops in after the verdict lands.
export function WinLossReveal({
  result,
  predicted,
  actual,
  streak,
}: {
  result: "win" | "loss";
  predicted: string | null;
  actual: string | null;
  streak: StreakData;
}) {
  if (result === "win") {
    return (
      <div className="winloss-card win verdict-drop">
        <div className="text-[60px] leading-none">✓</div>
        <div className="font-display italic text-[36px] sm:text-[48px] leading-tight mt-2">
          You called it.
        </div>
        <div className="text-[16px] mt-2 italic">
          You picked <strong>{predicted}</strong>. The Host agreed.
        </div>
        <div className="streak-counter mt-5">
          <span className="text-[20px]">🔥</span>
          <span className="font-display italic text-[42px] mono">{streak.current}</span>
          <span className="text-[11px] tracking-[0.18em] uppercase font-bold">
            in a row
          </span>
        </div>
        {streak.current === streak.best && streak.current >= 3 && (
          <div className="kicker mt-3">★ New personal best</div>
        )}
      </div>
    );
  }
  return (
    <div className="winloss-card loss verdict-drop">
      <div className="text-[60px] leading-none">✕</div>
      <div className="font-display italic text-[36px] sm:text-[48px] leading-tight mt-2">
        Streak broken.
      </div>
      <div className="text-[16px] mt-2 italic">
        You picked <strong>{predicted ?? "—"}</strong>. The Host called{" "}
        <strong>{actual ?? "no one"}</strong>.
      </div>
      <div className="streak-counter loss mt-5">
        <span className="text-[20px]">💀</span>
        <span className="font-display italic text-[42px] mono">0</span>
        <span className="text-[11px] tracking-[0.18em] uppercase font-bold">
          start over
        </span>
      </div>
      {streak.best > 0 && (
        <div className="kicker mt-3 not-italic" style={{ color: "var(--ink-3)" }}>
          Best streak: {streak.best}
        </div>
      )}
    </div>
  );
}
