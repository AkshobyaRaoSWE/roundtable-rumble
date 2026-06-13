"use client";

import { PERSONAS, type PersonaId } from "@/app/lib/personas";

export type DuelTurn = {
  speaker: PersonaId;
  text: string;
  status: "pending" | "streaming" | "done" | "error";
  beatBefore?: string; // narrator beat to render BEFORE this turn
};

// Sequential brawl, presented as a feature article transcript.
// One column. Big quoted text. Italic stage directions between turns.
export function DuelThread({
  fighters,
  turns,
}: {
  fighters: [PersonaId, PersonaId];
  turns: DuelTurn[];
}) {
  return (
    <div>
      <div className="text-center mb-4">
        <div className="act-label mb-2">Act II — The Brawl</div>
        <h3 className="headline text-[44px] sm:text-[60px]">
          {PERSONAS[fighters[0]].name}
          <em className="not-italic text-[var(--red)] mx-3 align-middle">vs</em>
          {PERSONAS[fighters[1]].name}
        </h3>
      </div>
      <div className="fancy-divider">
        <span className="ornament">§</span>
      </div>

      <div>
        {turns.map((t, i) => {
          const p = PERSONAS[t.speaker];
          return (
            <div key={i}>
              {t.beatBefore && t.text === "" && t.status === "pending" ? null : (
                t.beatBefore && (
                  <p className="stage-direction fade-in">{t.beatBefore}</p>
                )
              )}
              <div className="fade-rise mt-6 mb-8">
                <div className="flex items-center gap-4 mb-3">
                  <span className="byline" style={{ color: p.accent }}>
                    {p.name}
                  </span>
                  <span className="flex-1 border-t border-[var(--hair)]" />
                  {t.status === "streaming" && (
                    <span className="live-tag">
                      <span className="live-dot pulsing" />
                      Speaking
                    </span>
                  )}
                </div>
                <p
                  className={`pull-quote pl-5 ${
                    t.status === "streaming" ? "cursor" : ""
                  }`}
                  style={{ borderLeft: `3px solid ${p.accent}` }}
                >
                  {t.text || (
                    <span className="italic text-[var(--ink-3)] font-normal text-[16px] not-italic">
                      {t.status === "pending" ? "(waiting)" : "(writing…)"}
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
