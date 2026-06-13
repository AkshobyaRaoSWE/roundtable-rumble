"use client";

import type { PersonaId } from "@/app/lib/personas";

export type CharacterMood = "idle" | "speaking" | "dim" | "spot" | "winner" | "loser";

// Hand-drawn-ish SVG bust portraits, one per persona. Big head, big personality.
// Built so each part (head, mouth, eyes, body) can animate via CSS classes.
export function Character({
  id,
  mood = "idle",
  size = 180,
  facing = "front",
}: {
  id: PersonaId;
  mood?: CharacterMood;
  size?: number;
  facing?: "front" | "left" | "right";
}) {
  const wrapperClass = [
    "character",
    `character--${id}`,
    `character--${mood}`,
    facing !== "front" ? `character--face-${facing}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={wrapperClass}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className="character__svg"
      >
        {renderCharacter(id)}
      </svg>
    </div>
  );
}

function renderCharacter(id: PersonaId) {
  switch (id) {
    case "chad":      return <Chad />;
    case "karen":     return <Karen />;
    case "therapist": return <Therapist />;
    case "steve":     return <Steve />;
    case "theater":   return <Theater />;
    case "host":      return <Host />;
  }
}

// ──────────────────────────────────────────────────────────
// CHAD — square jaw, sunglasses, tank top, big arms
// ──────────────────────────────────────────────────────────
function Chad() {
  const stroke = "#1a1411";
  const skin = "#f1c89a";
  const skinShade = "#d9a679";
  const tank = "#ffffff";
  return (
    <g>
      {/* Body / shoulders */}
      <g className="character__body">
        <path
          d="M 30 200 L 30 165 Q 30 130 100 130 Q 170 130 170 165 L 170 200 Z"
          fill={tank}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Bicep peek */}
        <ellipse cx="35" cy="160" rx="18" ry="22" fill={skin} stroke={stroke} strokeWidth="3" />
        <ellipse cx="165" cy="160" rx="18" ry="22" fill={skin} stroke={stroke} strokeWidth="3" />
        {/* Tank straps */}
        <path d="M 70 130 L 80 200" stroke={stroke} strokeWidth="2.5" fill="none" />
        <path d="M 130 130 L 120 200" stroke={stroke} strokeWidth="2.5" fill="none" />
      </g>

      {/* Neck — thicker than head, obviously */}
      <rect x="78" y="90" width="44" height="40" fill={skin} stroke={stroke} strokeWidth="3" />
      <line x1="80" y1="115" x2="120" y2="115" stroke={skinShade} strokeWidth="2" />

      {/* Head */}
      <g className="character__head">
        <path
          d="M 50 70 Q 50 30 100 30 Q 150 30 150 70 L 150 100 Q 150 120 100 120 Q 50 120 50 100 Z"
          fill={skin}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Square jaw shadow */}
        <path d="M 60 100 Q 100 118 140 100" stroke={skinShade} strokeWidth="2" fill="none" />

        {/* Sunglasses */}
        <g>
          <rect x="55" y="55" width="40" height="22" rx="4" fill={stroke} />
          <rect x="105" y="55" width="40" height="22" rx="4" fill={stroke} />
          <rect x="93" y="62" width="14" height="3" fill={stroke} />
          {/* Reflection highlight */}
          <rect x="60" y="58" width="10" height="4" rx="1" fill="#ffffff" opacity="0.5" />
          <rect x="110" y="58" width="10" height="4" rx="1" fill="#ffffff" opacity="0.5" />
        </g>

        {/* Eyes (hidden behind sunglasses but here for blink hooks) */}
        <g className="character__eyes" opacity="0" />

        {/* Mouth */}
        <g className="character__mouth">
          <path
            d="M 78 100 Q 100 105 122 100"
            stroke={stroke}
            strokeWidth="3"
            fill="#5a2a1a"
            strokeLinecap="round"
          />
        </g>
      </g>
    </g>
  );
}

// ──────────────────────────────────────────────────────────
// KAREN — bob hair, glasses on chain, pursed lips
// ──────────────────────────────────────────────────────────
function Karen() {
  const stroke = "#1a1411";
  const skin = "#f9d4ba";
  const hair = "#e0a830";
  const top = "#e08aa8";
  return (
    <g>
      {/* Body / shoulders */}
      <g className="character__body">
        <path
          d="M 30 200 L 35 160 Q 50 130 100 130 Q 150 130 165 160 L 170 200 Z"
          fill={top}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Pearls */}
        <g>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <circle
              key={i}
              cx={70 + i * 10}
              cy={140 + Math.sin(i * 0.6) * 4}
              r="3.5"
              fill="#fdf6e3"
              stroke={stroke}
              strokeWidth="1.5"
            />
          ))}
        </g>
      </g>

      {/* Neck */}
      <rect x="84" y="100" width="32" height="30" fill={skin} stroke={stroke} strokeWidth="3" />

      {/* Head */}
      <g className="character__head">
        {/* Hair back */}
        <path
          d="M 40 95 Q 35 30 100 25 Q 165 30 160 95 L 160 110 Q 145 105 100 105 Q 55 105 40 110 Z"
          fill={hair}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Face */}
        <ellipse cx="100" cy="75" rx="48" ry="50" fill={skin} stroke={stroke} strokeWidth="3" />
        {/* Bob bangs */}
        <path
          d="M 52 55 Q 70 35 100 45 Q 130 35 148 55 L 148 70 Q 125 60 100 65 Q 75 60 52 70 Z"
          fill={hair}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Glasses */}
        <g>
          <ellipse cx="78" cy="80" rx="14" ry="11" fill="none" stroke={stroke} strokeWidth="2.5" />
          <ellipse cx="122" cy="80" rx="14" ry="11" fill="none" stroke={stroke} strokeWidth="2.5" />
          <line x1="92" y1="80" x2="108" y2="80" stroke={stroke} strokeWidth="2" />
          {/* Glasses chain */}
          <path d="M 64 80 Q 50 110 60 130" stroke={stroke} strokeWidth="1.5" fill="none" strokeDasharray="2 2" />
          <path d="M 136 80 Q 150 110 140 130" stroke={stroke} strokeWidth="1.5" fill="none" strokeDasharray="2 2" />
        </g>

        {/* Eyes */}
        <g className="character__eyes">
          <circle className="eye eye--l" cx="78" cy="80" r="3" fill={stroke} />
          <circle className="eye eye--r" cx="122" cy="80" r="3" fill={stroke} />
        </g>

        {/* Mouth — pursed, with lipstick */}
        <g className="character__mouth">
          <path d="M 90 100 Q 100 96 110 100 Q 100 106 90 100 Z" fill="#c84a6e" stroke={stroke} strokeWidth="2" />
        </g>
      </g>
    </g>
  );
}

// ──────────────────────────────────────────────────────────
// THERAPIST — bun, headband, eyes closed, calm
// ──────────────────────────────────────────────────────────
function Therapist() {
  const stroke = "#1a1411";
  const skin = "#e9c5b0";
  const hair = "#3a2018";
  const top = "#c4b08e";
  const headband = "#a08560";
  return (
    <g>
      {/* Body */}
      <g className="character__body">
        <path
          d="M 30 200 L 35 160 Q 55 130 100 130 Q 145 130 165 160 L 170 200 Z"
          fill={top}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Crystal necklace */}
        <line x1="100" y1="130" x2="100" y2="165" stroke={stroke} strokeWidth="1.5" />
        <path d="M 100 162 L 95 175 L 100 185 L 105 175 Z" fill="#aaa6e0" stroke={stroke} strokeWidth="1.5" />
      </g>

      {/* Neck */}
      <rect x="84" y="100" width="32" height="30" fill={skin} stroke={stroke} strokeWidth="3" />

      {/* Bun */}
      <ellipse cx="100" cy="22" rx="18" ry="12" fill={hair} stroke={stroke} strokeWidth="3" />

      {/* Head */}
      <g className="character__head">
        {/* Hair around */}
        <path
          d="M 50 60 Q 50 30 100 30 Q 150 30 150 60 L 150 75 Q 130 70 100 70 Q 70 70 50 75 Z"
          fill={hair}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Face */}
        <ellipse cx="100" cy="80" rx="46" ry="50" fill={skin} stroke={stroke} strokeWidth="3" />
        {/* Headband */}
        <path d="M 54 65 Q 100 55 146 65 L 146 75 Q 100 65 54 75 Z" fill={headband} stroke={stroke} strokeWidth="2.5" />

        {/* Eyes — closed (curved lines) */}
        <g className="character__eyes">
          <path d="M 70 86 Q 78 92 86 86" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 114 86 Q 122 92 130 86" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>

        {/* Mouth — gentle smile */}
        <g className="character__mouth">
          <path d="M 88 105 Q 100 112 112 105" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}

// ──────────────────────────────────────────────────────────
// STEVE — wild hair, foil hat, wide eyes, beard
// ──────────────────────────────────────────────────────────
function Steve() {
  const stroke = "#1a1411";
  const skin = "#e8c79a";
  const hair = "#666160";
  const beard = "#7a6f6c";
  const foil = "#c0c4c8";
  const shirt = "#5e7c4f";
  return (
    <g>
      {/* Body — plaid shirt */}
      <g className="character__body">
        <path
          d="M 30 200 L 35 160 Q 50 130 100 130 Q 150 130 165 160 L 170 200 Z"
          fill={shirt}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Plaid lines */}
        <line x1="60" y1="135" x2="60" y2="200" stroke="#3a4f30" strokeWidth="2" />
        <line x1="100" y1="135" x2="100" y2="200" stroke="#3a4f30" strokeWidth="2" />
        <line x1="140" y1="135" x2="140" y2="200" stroke="#3a4f30" strokeWidth="2" />
        <line x1="35" y1="155" x2="165" y2="155" stroke="#3a4f30" strokeWidth="2" />
        <line x1="32" y1="180" x2="168" y2="180" stroke="#3a4f30" strokeWidth="2" />
      </g>

      {/* Neck */}
      <rect x="86" y="100" width="28" height="32" fill={skin} stroke={stroke} strokeWidth="3" />

      {/* Foil hat */}
      <g>
        <path
          d="M 35 65 Q 100 5 165 65 L 168 80 L 32 80 Z"
          fill={foil}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M 100 14 L 100 35" stroke={stroke} strokeWidth="2" />
        <path d="M 100 14 L 90 26 M 100 14 L 110 26" stroke={stroke} strokeWidth="2" />
        {/* Crinkle highlights */}
        <path d="M 60 50 L 70 55 M 90 30 L 95 40 M 130 35 L 138 48 M 145 52 L 152 60" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
      </g>

      {/* Hair sticking out */}
      <path d="M 38 78 Q 30 100 45 110" stroke={hair} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M 162 78 Q 170 100 155 110" stroke={hair} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M 50 80 L 45 95" stroke={hair} strokeWidth="4" strokeLinecap="round" />
      <path d="M 150 80 L 155 95" stroke={hair} strokeWidth="4" strokeLinecap="round" />

      {/* Head */}
      <g className="character__head">
        <ellipse cx="100" cy="85" rx="48" ry="50" fill={skin} stroke={stroke} strokeWidth="3" />
        {/* Beard */}
        <path
          d="M 55 95 Q 50 130 100 135 Q 150 130 145 95 Q 130 110 100 110 Q 70 110 55 95 Z"
          fill={beard}
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Eyes — WIDE */}
        <g className="character__eyes">
          <circle cx="78" cy="88" r="9" fill="#ffffff" stroke={stroke} strokeWidth="2.5" />
          <circle cx="122" cy="88" r="9" fill="#ffffff" stroke={stroke} strokeWidth="2.5" />
          <circle className="eye eye--l" cx="78" cy="89" r="4.5" fill={stroke} />
          <circle className="eye eye--r" cx="122" cy="89" r="4.5" fill={stroke} />
          <circle cx="80" cy="87" r="1.5" fill="#ffffff" />
          <circle cx="124" cy="87" r="1.5" fill="#ffffff" />
        </g>

        {/* Mouth — small open in beard */}
        <g className="character__mouth">
          <ellipse cx="100" cy="115" rx="6" ry="4" fill="#3a1a1a" stroke={stroke} strokeWidth="1.5" />
        </g>
      </g>
    </g>
  );
}

// ──────────────────────────────────────────────────────────
// THEATER KID — floppy hair, bow tie, hand to chest, open mouth
// ──────────────────────────────────────────────────────────
function Theater() {
  const stroke = "#1a1411";
  const skin = "#f4cfac";
  const hair = "#7a4a28";
  const shirt = "#ffffff";
  const bowtie = "#1a1411";
  const accent = "#e0a02a";
  return (
    <g>
      {/* Body — white shirt */}
      <g className="character__body">
        <path
          d="M 30 200 L 35 160 Q 55 130 100 130 Q 145 130 165 160 L 170 200 Z"
          fill={shirt}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Suspenders */}
        <path d="M 75 130 L 80 200" stroke={accent} strokeWidth="4" strokeLinecap="round" />
        <path d="M 125 130 L 120 200" stroke={accent} strokeWidth="4" strokeLinecap="round" />
        {/* Hand to chest */}
        <ellipse cx="100" cy="180" rx="14" ry="10" fill={skin} stroke={stroke} strokeWidth="2.5" />
        <path d="M 90 178 Q 100 174 110 178 M 90 182 Q 100 178 110 182" stroke={stroke} strokeWidth="1.5" fill="none" />
      </g>

      {/* Neck + bow tie */}
      <rect x="86" y="100" width="28" height="30" fill={skin} stroke={stroke} strokeWidth="3" />
      <g>
        <path d="M 75 130 L 90 122 L 90 138 Z" fill={bowtie} stroke={stroke} strokeWidth="2" />
        <path d="M 125 130 L 110 122 L 110 138 Z" fill={bowtie} stroke={stroke} strokeWidth="2" />
        <rect x="92" y="125" width="16" height="10" rx="2" fill={bowtie} stroke={stroke} strokeWidth="2" />
      </g>

      {/* Head */}
      <g className="character__head">
        {/* Floppy hair */}
        <path
          d="M 45 60 Q 40 25 100 22 Q 160 25 155 60 Q 145 50 130 55 Q 115 40 100 50 Q 85 40 70 55 Q 55 50 45 60 Z"
          fill={hair}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Face */}
        <ellipse cx="100" cy="82" rx="46" ry="48" fill={skin} stroke={stroke} strokeWidth="3" />
        {/* Hair swoop over forehead */}
        <path d="M 60 60 Q 75 55 95 70 Q 105 60 130 58 Q 145 60 150 70 L 145 78 Q 110 70 60 75 Z" fill={hair} stroke={stroke} strokeWidth="2.5" />

        {/* Eyes — closed in performance */}
        <g className="character__eyes">
          <path d="M 70 85 Q 78 80 86 85" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 114 85 Q 122 80 130 85" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* lashes */}
          <line x1="68" y1="83" x2="65" y2="80" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="132" y1="83" x2="135" y2="80" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Mouth — wide open singing */}
        <g className="character__mouth">
          <ellipse cx="100" cy="108" rx="10" ry="14" fill="#5a1a1a" stroke={stroke} strokeWidth="2.5" />
          <ellipse cx="100" cy="115" rx="6" ry="4" fill="#c44a4a" />
        </g>
      </g>
    </g>
  );
}

// ──────────────────────────────────────────────────────────
// HOST — slick suit, mic, smug grin
// ──────────────────────────────────────────────────────────
function Host() {
  const stroke = "#1a1411";
  const skin = "#e8b48a";
  const hair = "#1a1411";
  const suit = "#1a1411";
  const tie = "#a51919";
  return (
    <g>
      {/* Body — suit */}
      <g className="character__body">
        <path
          d="M 30 200 L 35 160 Q 55 130 100 130 Q 145 130 165 160 L 170 200 Z"
          fill={suit}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Suit lapels */}
        <path d="M 75 130 L 95 170 L 90 200 Z" fill="#0a0805" stroke={stroke} strokeWidth="2" />
        <path d="M 125 130 L 105 170 L 110 200 Z" fill="#0a0805" stroke={stroke} strokeWidth="2" />
        {/* Tie */}
        <path d="M 95 130 L 100 175 L 105 130 Z" fill={tie} stroke={stroke} strokeWidth="2" />
        <path d="M 95 175 L 100 195 L 105 175 Z" fill={tie} stroke={stroke} strokeWidth="2" />
        {/* Mic in hand */}
        <g transform="translate(150 165) rotate(-25)">
          <rect x="-3" y="0" width="6" height="22" fill="#444" stroke={stroke} strokeWidth="1.5" />
          <ellipse cx="0" cy="-2" rx="8" ry="10" fill="#888" stroke={stroke} strokeWidth="2" />
          <ellipse cx="0" cy="-3" rx="5" ry="7" fill="#444" />
        </g>
      </g>

      {/* Neck */}
      <rect x="86" y="100" width="28" height="32" fill={skin} stroke={stroke} strokeWidth="3" />

      {/* Head */}
      <g className="character__head">
        {/* Slicked hair */}
        <path
          d="M 50 50 Q 100 30 150 50 L 150 75 Q 145 65 100 65 Q 55 65 50 75 Z"
          fill={hair}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Face */}
        <ellipse cx="100" cy="82" rx="46" ry="48" fill={skin} stroke={stroke} strokeWidth="3" />
        {/* Hair part highlight */}
        <line x1="120" y1="55" x2="135" y2="68" stroke="#3a2a20" strokeWidth="2" />

        {/* Eyebrows — raised, smug */}
        <path d="M 68 75 Q 78 70 86 75" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 114 75 Q 122 70 132 75" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Eyes — half-lidded */}
        <g className="character__eyes">
          <path d="M 70 88 Q 78 92 86 88" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 114 88 Q 122 92 130 88" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="78" cy="90" r="2" fill={stroke} />
          <circle cx="122" cy="90" r="2" fill={stroke} />
        </g>

        {/* Mouth — smirk */}
        <g className="character__mouth">
          <path d="M 88 108 Q 100 113 115 105" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}
