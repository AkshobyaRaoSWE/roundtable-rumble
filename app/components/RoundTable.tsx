"use client";

import { PERSONAS, type PersonaId } from "@/app/lib/personas";
import { Character, type CharacterMood } from "./Character";
import { SpeechBubble } from "./SpeechBubble";

export type Speaker = {
  id: PersonaId;
  text: string;
  status: "pending" | "streaming" | "done" | "error";
};

// Five characters arranged around an oval table.
// Positions calculated to feel like a 3/4 view with the table center towards bottom.
const TABLE_POSITIONS: Record<PersonaId, { x: number; y: number; tail: "down" | "down-left" | "down-right"; bubbleX: number; bubbleY: number }> = {
  // top-left
  chad:      { x: 12,  y: 8,  tail: "down-right", bubbleX: -8,  bubbleY: -120 },
  // top-right
  karen:     { x: 65,  y: 8,  tail: "down-left",  bubbleX: 0,   bubbleY: -120 },
  // mid-left
  therapist: { x: 0,   y: 38, tail: "down-right", bubbleX: 60,  bubbleY: 30 },
  // mid-right
  steve:     { x: 78,  y: 38, tail: "down-left",  bubbleX: -190,bubbleY: 30 },
  // bottom-center (closest to viewer)
  theater:   { x: 38,  y: 60, tail: "down",       bubbleX: 30,  bubbleY: -120 },
  host:      { x: 38,  y: 0,  tail: "down",       bubbleX: 30,  bubbleY: -100 },
};

export function RoundTable({
  topic,
  speakers,
  spotlightIds = [],
  dimmed = false,
  hostText,
  hostStatus,
}: {
  topic: string;
  speakers: Record<PersonaId, Speaker>;
  spotlightIds?: PersonaId[];
  dimmed?: boolean;
  hostText?: string;
  hostStatus?: "pending" | "streaming" | "done" | "error";
}) {
  const panelists: PersonaId[] = ["chad", "karen", "therapist", "steve", "theater"];
  return (
    <div className="round-table-stage">
      {/* The table itself */}
      <div className="round-table">
        <div className="round-table__top">
          <div className="round-table__topic">
            <div className="round-table__topic-label">Tonight&apos;s Question</div>
            <div className="round-table__topic-text">&ldquo;{topic}&rdquo;</div>
          </div>
        </div>
        <div className="round-table__rim" />
        <div className="round-table__shadow" />
      </div>

      {/* Panelists arranged around table */}
      {panelists.map((id) => {
        const pos = TABLE_POSITIONS[id];
        const speaker = speakers[id];
        const persona = PERSONAS[id];
        const isSpotlight = spotlightIds.includes(id);
        const isOtherSpotlight = spotlightIds.length > 0 && !isSpotlight;
        const mood: CharacterMood =
          speaker?.status === "streaming"
            ? "speaking"
            : isSpotlight
            ? "spot"
            : isOtherSpotlight || dimmed
            ? "dim"
            : "idle";

        return (
          <div
            key={id}
            className={`character-slot character-slot--${id}`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
            }}
          >
            <div className="character-nameplate">{persona.name}</div>
            <Character id={id} mood={mood} size={140} />
            {speaker && (speaker.text || speaker.status === "streaming") && (
              <div
                className="character-bubble"
                style={{
                  transform: `translate(${pos.bubbleX}px, ${pos.bubbleY}px)`,
                }}
              >
                <SpeechBubble
                  tail={pos.tail}
                  isStreaming={speaker.status === "streaming"}
                  accent={persona.accent}
                  size="sm"
                >
                  {speaker.text || (
                    <span className="italic opacity-50 text-[12px]">…</span>
                  )}
                </SpeechBubble>
              </div>
            )}
          </div>
        );
      })}

      {/* Host can drop in from the top */}
      {hostText !== undefined && (
        <div className="character-slot character-slot--host host-drop-in">
          <div className="character-nameplate">The Host</div>
          <Character id="host" mood={hostStatus === "streaming" ? "speaking" : "spot"} size={160} />
          <div className="character-bubble" style={{ transform: "translate(20px, -130px)" }}>
            <SpeechBubble
              tail="down"
              isStreaming={hostStatus === "streaming"}
              accent={PERSONAS.host.accent}
              size="md"
            >
              {hostText || <span className="italic opacity-50 text-[12px]">…</span>}
            </SpeechBubble>
          </div>
        </div>
      )}
    </div>
  );
}

// A focused 1v1 brawl scene — two fighters facing each other big on stage.
export function BrawlStage({
  fighters,
  turns,
}: {
  fighters: [PersonaId, PersonaId];
  turns: { speaker: PersonaId; text: string; status: "pending" | "streaming" | "done" | "error" }[];
}) {
  const [A, B] = fighters;
  const lastTurn = turns.findLast?.((t) => t.text || t.status === "streaming") ?? null;

  return (
    <div className="brawl-stage">
      <div className="brawl-stage__bg" />
      <div className="brawl-stage__title">
        <span style={{ color: PERSONAS[A].accent }}>{PERSONAS[A].name}</span>
        <span className="vs">VS</span>
        <span style={{ color: PERSONAS[B].accent }}>{PERSONAS[B].name}</span>
      </div>

      <div className="brawl-stage__arena">
        <div
          className={`brawl-fighter brawl-fighter--left ${
            lastTurn?.speaker === A ? "is-active" : ""
          }`}
        >
          {lastTurn?.speaker === A && lastTurn?.text && (
            <div className="brawl-bubble brawl-bubble--left">
              <SpeechBubble
                tail="down-right"
                isStreaming={lastTurn.status === "streaming"}
                accent={PERSONAS[A].accent}
                size="md"
              >
                {lastTurn.text}
              </SpeechBubble>
            </div>
          )}
          <Character id={A} mood={lastTurn?.speaker === A && lastTurn.status === "streaming" ? "speaking" : "spot"} size={200} />
          <div className="character-nameplate">{PERSONAS[A].name}</div>
        </div>

        <div className="brawl-stage__divider">
          <span>VS</span>
        </div>

        <div
          className={`brawl-fighter brawl-fighter--right ${
            lastTurn?.speaker === B ? "is-active" : ""
          }`}
        >
          {lastTurn?.speaker === B && lastTurn?.text && (
            <div className="brawl-bubble brawl-bubble--right">
              <SpeechBubble
                tail="down-left"
                isStreaming={lastTurn.status === "streaming"}
                accent={PERSONAS[B].accent}
                size="md"
              >
                {lastTurn.text}
              </SpeechBubble>
            </div>
          )}
          <Character id={B} mood={lastTurn?.speaker === B && lastTurn.status === "streaming" ? "speaking" : "spot"} size={200} facing="left" />
          <div className="character-nameplate">{PERSONAS[B].name}</div>
        </div>
      </div>

      {/* Turn ticker showing all 6 punches */}
      <div className="brawl-ticker">
        {turns.map((t, i) => {
          const filled = t.status === "done" || t.status === "error";
          const active = t.status === "streaming";
          return (
            <div
              key={i}
              className={`brawl-tick ${filled ? "is-filled" : ""} ${active ? "is-active" : ""}`}
              style={{ background: filled ? PERSONAS[t.speaker].accent : undefined }}
            />
          );
        })}
      </div>
    </div>
  );
}
