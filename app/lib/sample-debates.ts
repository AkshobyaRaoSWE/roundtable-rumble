// Hand-curated sample debates that show off the format on the homepage.
// These are the *best of*; they prove the format works and pull people in.

import type { PersonaId } from "./personas";

export type SampleTake = { id: PersonaId; text: string };

export type SampleDebate = {
  topic: string;
  date: string;          // for the byline
  takes: SampleTake[];   // 5 takes
  brawl: { id: PersonaId; text: string }[]; // 4 turns A, B, A, B
  verdict: string;       // what the Host said
};

export const SAMPLE_DEBATES: SampleDebate[] = [
  {
    topic: "Is cereal a soup?",
    date: "May 4",
    takes: [
      {
        id: "chad",
        text: "Cereal is fuel, soup is for sick people. You're cooked if you can't tell the difference.",
      },
      {
        id: "karen",
        text: "My friend Diane the paralegal says anything in a bowl is technically a soup. Frankly, this is settled.",
      },
      {
        id: "therapist",
        text: "I'm noticing a lot of categorical anxiety here. What if the real soup was the breakfast we had along the way?",
      },
      {
        id: "steve",
        text: "Cereal is a soup. The Bohemian Grove reclassified it in 1994 to control breakfast linguistics. Wake up.",
      },
      {
        id: "theater",
        text: "*gasps* The very question is a slap in the face to the nuanced art of breakfast as performance.",
      },
    ],
    brawl: [
      { id: "karen", text: "Steve, the Bohemian Grove did not 'reclassify' anything, you live in your mother's pantry." },
      { id: "steve", text: "Karen, your friend Diane is a Federal Reserve operative and I have the documents." },
      { id: "karen", text: "I will be writing a one-star Yelp review of your apartment, your beliefs, and your milk." },
      { id: "steve", text: "Yelp is a CIA front, and your one-star review just made it into my permanent file." },
    ],
    verdict:
      "Verdict: Karen wins. Diane the paralegal is fictional but is somehow more credible than Steve's documents.",
  },
  {
    topic: "Should pineapple be on pizza?",
    date: "May 6",
    takes: [
      {
        id: "chad",
        text: "Pineapple on pizza is so beta. Spiking your insulin mid-meal? You're falling off, no cap.",
      },
      {
        id: "karen",
        text: "I had it once in Maui and it was acceptable. In Ohio it is a war crime. There are rules.",
      },
      {
        id: "therapist",
        text: "Have you sat with why this question feels so triggering? Often food rigidity is just a parent's shame about joy.",
      },
      {
        id: "steve",
        text: "Hawaiian pizza was invented by a Greek-Canadian in 1962. Greek. Canadian. Hawaiian. It's a triple-layered psyop.",
      },
      {
        id: "theater",
        text: "In high school I played the lead in Joseph and the Amazing Technicolor Dreamcoat and pineapple changed me.",
      },
    ],
    brawl: [
      { id: "chad", text: "Therapist, my dad was great, I just don't want sugar on my dinner, you're glazing." },
      { id: "therapist", text: "Chad, that immediate denial is a fawn response wearing a tank top." },
      { id: "chad", text: "Bro, I will out-bench every emotion you've ever had, this is a base take." },
      { id: "therapist", text: "And I'm hearing that benching your feelings is, in fact, the entire problem." },
    ],
    verdict:
      "Verdict: The Therapist wins. Chad just demonstrated the exact thing she was diagnosing in real time.",
  },
  {
    topic: "Is therapy actually working?",
    date: "May 8",
    takes: [
      {
        id: "chad",
        text: "Therapy is for NPCs. Girlfriend dumped me, I did 500 pushups, I'm a different man.",
      },
      {
        id: "karen",
        text: "I tried it once. The woman didn't validate me. Left a one-star review and moved on with my life.",
      },
      {
        id: "therapist",
        text: "I'm noticing real defensive activation in the room. What if the question itself is your inner child asking for help?",
      },
      {
        id: "steve",
        text: "Therapy was invented by the CIA in 1953 to track American moods. Look up Operation MK-Couch.",
      },
      {
        id: "theater",
        text: "*one tear* My therapist said I 'monologue too much' and now I haven't returned. The work IS the work.",
      },
    ],
    brawl: [
      { id: "theater", text: "Karen, you didn't try therapy, you tried a one-star review. There is a difference." },
      { id: "karen", text: "Theater Kid, you cry on cue, you don't get to lecture me about anything." },
      { id: "theater", text: "*scoffs* I cry on truth, Karen, not on cue, and Sondheim would be DISGUSTED with you." },
      { id: "karen", text: "I have a Facebook group of moms who hate Sondheim and we are organized." },
    ],
    verdict:
      "Verdict: The Therapist wins by default. Everyone else needs her, and they all just proved it on camera.",
  },
];
