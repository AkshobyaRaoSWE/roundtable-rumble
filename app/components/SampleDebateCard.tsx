"use client";

import { PERSONAS } from "@/app/lib/personas";
import type { SampleDebate } from "@/app/lib/sample-debates";

export function SampleDebateCard({
  debate,
  onPick,
}: {
  debate: SampleDebate;
  onPick: (topic: string) => void;
}) {
  const featured = debate.takes.slice(0, 2);
  return (
    <article className="flex flex-col h-full">
      <div className="dateline mb-2">{debate.date} &middot; In the room</div>
      <h3 className="headline text-[26px] sm:text-[30px] mb-4">
        &ldquo;{debate.topic}&rdquo;
      </h3>
      <div className="rule-hair mb-5" />

      <div className="space-y-5 flex-1">
        {featured.map((take) => {
          const p = PERSONAS[take.id];
          return (
            <blockquote key={take.id}>
              <p
                className="pull-quote text-[20px] pl-3"
                style={{ borderLeft: `3px solid ${p.accent}`, fontSize: 19 }}
              >
                &ldquo;{take.text}&rdquo;
              </p>
              <div className="byline mt-2 ml-3" style={{ color: p.accent }}>
                — {p.name}
              </div>
            </blockquote>
          );
        })}
      </div>

      <div className="rule-hair my-5" />
      <div className="kicker mb-1">Verdict</div>
      <p className="body-text font-medium" style={{ fontSize: 17 }}>
        {debate.verdict}
      </p>

      <button
        onClick={() => onPick(debate.topic)}
        className="btn-text self-start mt-5"
      >
        Re-run this debate →
      </button>
    </article>
  );
}
