"use client";

import type { Persona } from "@/app/lib/personas";

export type LaneStatus = "idle" | "streaming" | "done" | "error";

// A character "lane" rendered as a newspaper column — no enclosing box.
// Adjacent columns are separated by a hairline rule (.col + .col rule in globals).
export function CharacterLane({
  persona,
  text,
  status,
  onShare,
}: {
  persona: Persona;
  text: string;
  status: LaneStatus;
  onShare?: () => void;
}) {
  const showCursor = status === "streaming";
  return (
    <div className="col edit-in flex flex-col">
      <div className={`col-head ${status === "streaming" ? "live" : ""}`}>
        <div className="flex items-baseline justify-between gap-2">
          <div className="byline">{persona.name}</div>
          {status === "streaming" && (
            <span className="live-tag">
              <span className="live-dot pulsing" />
              Live
            </span>
          )}
        </div>
        <div className="text-[12px] text-neutral-500 mt-1 italic">
          {persona.tagline}
        </div>
      </div>

      <div className="flex-1 min-h-[140px]">
        {!text && status === "idle" && (
          <div className="text-neutral-400 text-[13px] italic">Yet to speak.</div>
        )}
        {!text && status === "streaming" && (
          <div className="text-neutral-500 text-[14px] italic">
            <span>Writing</span>
            <span className="cursor"></span>
          </div>
        )}
        {text && (
          <p
            className={`body-text ${showCursor ? "cursor" : ""}`}
            style={{ color: status === "error" ? "var(--red)" : "var(--ink)" }}
          >
            {text}
          </p>
        )}
      </div>

      {status === "done" && onShare && text && (
        <button
          onClick={onShare}
          className="mt-3 self-start text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-500 hover:text-[var(--red)] transition"
        >
          Copy quote →
        </button>
      )}
    </div>
  );
}
