"use client";

import { PERSONAS } from "@/app/lib/personas";

export function Verdict({
  text,
  status,
  beatBefore,
  onShare,
}: {
  text: string;
  status: "pending" | "streaming" | "done" | "error";
  beatBefore?: string;
  onShare?: () => void;
}) {
  const host = PERSONAS.host;
  return (
    <section className="text-center mt-12 fade-rise">
      {beatBefore && <p className="stage-direction fade-in">{beatBefore}</p>}
      <div className="fancy-divider">
        <span className="ornament">§</span>
      </div>
      <div className="act-label mb-4">Act III — The Verdict</div>
      <p
        className={`headline text-[34px] sm:text-[48px] md:text-[60px] max-w-3xl mx-auto ${
          status === "streaming" ? "cursor" : ""
        }`}
      >
        {text || (
          <span className="italic text-[var(--ink-3)] font-normal text-[18px]">
            {status === "pending"
              ? "the host is reviewing the tape…"
              : "writing…"}
          </span>
        )}
      </p>
      <div className="byline mt-8" style={{ color: host.accent }}>
        — The Host
      </div>
      {status === "done" && text && onShare && (
        <button onClick={onShare} className="btn-text mt-10">
          Copy verdict →
        </button>
      )}
    </section>
  );
}
