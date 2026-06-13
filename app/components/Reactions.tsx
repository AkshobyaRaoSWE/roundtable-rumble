"use client";

import { useState } from "react";
import { sfxPop } from "@/app/lib/sounds";

const REACTS: { emoji: string; label: string }[] = [
  { emoji: "🔥", label: "fire" },
  { emoji: "💀", label: "dead" },
  { emoji: "🤡", label: "clown" },
  { emoji: "🤝", label: "based" },
];

// Local-only reaction counts. No persistence. Just dopamine.
export function Reactions({ id }: { id: string }) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [bumpKey, setBumpKey] = useState<string | null>(null);

  function bump(label: string) {
    sfxPop();
    setCounts((c) => ({ ...c, [label]: (c[label] ?? 0) + 1 }));
    setBumpKey(label);
    setTimeout(() => setBumpKey(null), 220);
  }

  return (
    <div className="flex items-center gap-2 mt-3" data-react-id={id}>
      {REACTS.map((r) => {
        const count = counts[r.label] ?? 0;
        const isBumping = bumpKey === r.label;
        return (
          <button
            key={r.label}
            onClick={() => bump(r.label)}
            className="reaction-chip"
            aria-label={r.label}
          >
            <span
              className="text-[18px] leading-none inline-block"
              style={{
                transform: isBumping ? "scale(1.4) rotate(-8deg)" : "scale(1)",
                transition: "transform 200ms cubic-bezier(0.34,1.6,0.64,1)",
              }}
            >
              {r.emoji}
            </span>
            {count > 0 && (
              <span className="ml-1 text-[12px] font-bold tabular-nums text-[var(--ink-2)]">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
