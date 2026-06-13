// Stage directions that play between speakers and rounds.
// Pre-written so they're free, fast, and consistent in voice.
// Persona-specific intros help each character get a real entrance.

import type { PersonaId } from "./personas";

// "Cold open" before each speaker takes the floor in Act I
export const SPEAKER_INTROS: Record<PersonaId, string[]> = {
  chad: [
    "First up, the gym bro known only as Chad. He cracks his neck audibly.",
    "Chad clears his throat. He's been waiting. He sips his pre-workout.",
    "Chad rises to the mic without being asked. His tank top reads 'TEAM ME'.",
    "Chad. Twenty-two. Sigma. He smiles like he's about to lift something.",
  ],
  karen: [
    "Karen straightens her cardigan. She has been taking notes.",
    "Karen adjusts her glasses. Her bracelets catch the light. She begins.",
    "Karen. Soccer mom. Yelp Elite. She inhales as if to register a complaint.",
    "Karen's hand goes up, even though no one called on her.",
  ],
  therapist: [
    "The Therapist closes her eyes briefly, then opens them with intent.",
    "The Therapist takes a long, regulated breath. The room takes one with her.",
    "The Therapist tilts her head. She is, somehow, already disappointed in you.",
    "The Therapist nods, as if you have already said something. You have not.",
  ],
  steve: [
    "Steve leans into the microphone. His eyes dart to the corners of the room.",
    "Steve adjusts his foil-lined hat. He has been preparing for this.",
    "Steve glances at the ceiling, then at the door, then at the ceiling again.",
    "Steve. Forty-something. Reads everything. Believes most of it. He smiles.",
  ],
  theater: [
    "The Theater Kid stands. There is no need to stand. He stands anyway.",
    "The Theater Kid takes center stage, even though there is no stage.",
    "The Theater Kid hits a pose that would be called 'iconic' in his memoir.",
    "The Theater Kid produces a single, perfect tear. The room is unmoved.",
  ],
  host: ["The Host clears his throat."],
};

// Tiny beats between speakers in Act I (don't directly name a character)
export const INTERLUDES: string[] = [
  "The room is quiet for half a beat.",
  "Someone in the back shifts in their chair.",
  "The fluorescent light buzzes.",
  "A pen drops. Nobody picks it up.",
  "The Host raises an eyebrow but says nothing.",
  "There is a long, unkind silence.",
  "Outside, a car horn. Nobody flinches.",
  "A staffer brings water. Nobody drinks it.",
];

// Pre-brawl
export const PRE_BRAWL: string[] = [
  "And then the room turns on itself.",
  "The pleasantries are over.",
  "Two of them are now standing.",
  "Someone says a name. Nobody is sure who.",
  "The temperature of the room changes by a degree or two.",
];

// Inside the brawl, between turns
export const BRAWL_INTERLUDES: string[] = [
  "[NAME]'s jaw tightens.",
  "[NAME] does not blink.",
  "The Host lets it ride.",
  "A long, terrible pause.",
  "Someone laughs. Maybe nervously.",
  "[NAME] takes a half-step forward.",
  "The audience leans in.",
  "[NAME] mouths something. It is not for the cameras.",
];

// Pre-verdict
export const PRE_VERDICT: string[] = [
  "The Host has been silent. Until now.",
  "The Host clears his throat. The room stops moving.",
  "All eyes go to the head of the table.",
  "The Host taps the desk twice. The fight is over.",
  "The Host puts down his coffee. This is the moment.",
];

// ──────── pickers ────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getSpeakerIntro(id: PersonaId): string {
  return pick(SPEAKER_INTROS[id]);
}

export function getInterlude(): string {
  return pick(INTERLUDES);
}

export function getPreBrawl(): string {
  return pick(PRE_BRAWL);
}

export function getBrawlBeat(name: string): string {
  return pick(BRAWL_INTERLUDES).replaceAll("[NAME]", name);
}

export function getPreVerdict(): string {
  return pick(PRE_VERDICT);
}
