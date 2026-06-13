// Tonight's hot takes — visible on the homepage list.
export const TOPICS: { topic: string; category: string }[] = [
  { topic: "Is cereal a soup?",                              category: "food" },
  { topic: "Should pineapple be on pizza?",                  category: "food" },
  { topic: "Are dogs better than cats?",                     category: "vibes" },
  { topic: "Is going to the gym a personality?",             category: "vibes" },
  { topic: "Is your boss actually that bad?",                category: "work" },
  { topic: "Is college worth it anymore?",                   category: "life" },
  { topic: "Should kids have phones before high school?",    category: "life" },
  { topic: "Is therapy actually working?",                   category: "vibes" },
  { topic: "Was the dress blue or gold?",                    category: "internet" },
  { topic: "Is dating apps cooked?",                         category: "life" },
  { topic: "Should TikTok be banned?",                       category: "internet" },
  { topic: "Are you the toxic friend?",                      category: "vibes" },
];

// Bigger pool for the "🎲 Surprise me" button — short, fun, fight-bait topics.
export const SURPRISE_TOPICS: string[] = [
  ...TOPICS.map((t) => t.topic),
  "Is water wet?",
  "Is a hot dog a sandwich?",
  "Should socks match?",
  "Is breakfast actually the most important meal?",
  "Are weddings a scam?",
  "Should you tip 20% always?",
  "Is the customer always right?",
  "Are introverts faking it?",
  "Is small talk evil?",
  "Should you split the bill on a first date?",
  "Is brunch overrated?",
  "Are gym selfies a cry for help?",
  "Should remote work die?",
  "Is reading on Kindle real reading?",
  "Are podcasts the new books?",
  "Is the Oxford comma worth dying for?",
  "Should adults watch cartoons?",
  "Is being on time a love language?",
  "Are mornings for psychopaths?",
  "Should you ghost or be honest?",
  "Is astrology fake?",
  "Are you secretly the villain?",
  "Should you keep your shoes on at home?",
  "Is texting back fast desperate?",
  "Should beans be in chili?",
  "Is sushi overrated?",
  "Are open relationships a vibe?",
  "Should you go to your high school reunion?",
  "Is air conditioning a human right?",
];

export function pickSurprise(): string {
  return SURPRISE_TOPICS[Math.floor(Math.random() * SURPRISE_TOPICS.length)];
}
