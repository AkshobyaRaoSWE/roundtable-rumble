"use client";

import type { Persona } from "@/app/lib/personas";

export type BlockStatus = "pending" | "streaming" | "done" | "error";

// A long-form newspaper "interview" block: byline divider, attribution, big body.
export function SpeakerBlock({
  persona,
  text,
  status,
  showCursor,
  dropCap = true,
}: {
  persona: Persona;
  text: string;
  status: BlockStatus;
  showCursor: boolean;
  dropCap?: boolean;
}) {
  return (
    <section className="my-10 fade-rise">
      {/* Byline divider — small caps + thin rule, no boxes */}
      <div className="flex items-center gap-4 mb-5">
        <span className="byline" style={{ color: persona.accent }}>
          {persona.name}
        </span>
        <span className="flex-1 border-t border-[var(--hair)]" />
        <span className="dateline" style={{ fontStyle: "italic" }}>
          {persona.tagline}
        </span>
        {status === "streaming" && (
          <span className="live-tag">
            <span className="live-dot pulsing" />
            Speaking
          </span>
        )}
      </div>

      {/* The quoted body */}
      <p
        className={`body-text-lg ${dropCap && text ? "dropcap" : ""} ${
          showCursor ? "cursor" : ""
        }`}
        style={{ color: status === "error" ? "var(--red)" : "var(--ink)" }}
      >
        {text || (
          <span className="italic text-[var(--ink-3)] text-[16px]">
            {status === "pending" ? "(yet to speak)" : "(writing…)"}
          </span>
        )}
      </p>
    </section>
  );
}
