import Groq from "groq-sdk";
import { PERSONAS, type PersonaId } from "@/app/lib/personas";
import { SHOW_NAME } from "@/app/lib/brand";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// All modes use 70B Versatile — when openings fire in PARALLEL the wait is
// gated by the slowest single call (~1s), so quality wins. 8B is faster but
// the comedy lands worse, and the comedy is the entire product.
const MODEL = "llama-3.3-70b-versatile";

type Mode = "opening" | "duel" | "verdict";

type Body = {
  character: PersonaId;
  topic: string;
  mode: Mode;
  context?: { name: string; text: string }[];
  opponent?: string;
  fighters?: string[];
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return new Response("bad json", { status: 400 });
  }

  const persona = PERSONAS[body.character];
  if (!persona) return new Response("unknown character", { status: 400 });

  const topic = (body.topic || "").trim().slice(0, 500);
  if (!topic) return new Response("missing topic", { status: 400 });

  // Bring-your-own-key: prefer the key the user pasted in the browser (sent as a
  // header), fall back to a server env key for local dev. The key is only used to
  // call Groq for this request; it is never stored server-side.
  const apiKey = req.headers.get("x-groq-key")?.trim() || process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(
      "No Groq API key. Click the key button and paste your own Groq key to start.",
      { status: 401 },
    );
  }

  const groq = new Groq({ apiKey });

  let userTurn: string;
  let temperature = 0.95;
  let maxTokens = 200;

  switch (body.mode) {
    case "opening":
      userTurn = openingPrompt(topic);
      maxTokens = 160; // tighter — 1-2 sentences each, fast
      temperature = 1.0;
      break;
    case "duel":
      if (!body.opponent || !body.context?.length) {
        return new Response("duel needs opponent and context", { status: 400 });
      }
      userTurn = duelPrompt(topic, body.opponent, body.context);
      maxTokens = 110;
      temperature = 0.95;
      break;
    case "verdict":
      if (!body.fighters || body.fighters.length !== 2 || !body.context?.length) {
        return new Response("verdict needs fighters[2] and context", { status: 400 });
      }
      userTurn = verdictPrompt(topic, body.fighters, body.context);
      temperature = 0.85;
      maxTokens = 80;
      break;
    default:
      return new Response("unknown mode", { status: 400 });
  }

  let stream;
  try {
    stream = await groq.chat.completions.create({
      model: MODEL,
      stream: true,
      max_tokens: maxTokens,
      temperature,
      messages: [
        { role: "system", content: persona.systemPrompt },
        { role: "user", content: userTurn },
      ],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "groq error";
    return new Response(`[error: ${msg}]`, { status: 500 });
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        }
        controller.close();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "stream error";
        controller.enqueue(encoder.encode(`\n[stream error: ${msg}]`));
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

function openingPrompt(topic: string): string {
  return `Tonight on ${SHOW_NAME}:

"${topic}"

Deliver your opening take. 1 to 2 SHORT sentences. ONE punchline. Stay completely in character. Reveal your obvious bias. No quote marks. No "as an AI". Just go.`;
}

function duelPrompt(
  topic: string,
  opponent: string,
  context: { name: string; text: string }[],
): string {
  const transcript = context
    .map((t) => `${t.name.toUpperCase()}: ${t.text}`)
    .join("\n\n");
  const last = context[context.length - 1];
  return `You are in a TV brawl with ${opponent.toUpperCase()} on ${SHOW_NAME}.
Topic: "${topic}"

Transcript so far:
${transcript}

Hit back at ${last.name.toUpperCase()} who just said: "${last.text}"

Quote a phrase of theirs and dunk on it. ONE or TWO sentences MAX. Personal, specific, escalating. Build on what's been said. No setup. Just the punch.`;
}

function verdictPrompt(
  topic: string,
  fighters: string[],
  context: { name: string; text: string }[],
): string {
  const transcript = context
    .map((t) => `${t.name.toUpperCase()}: ${t.text}`)
    .join("\n\n");
  return `Topic of the brawl: "${topic}"

The two fighters: ${fighters[0].toUpperCase()} vs ${fighters[1].toUpperCase()}

Full transcript:
${transcript}

Now deliver your verdict. ONE sentence. Start with "Verdict: " then the winner's first name (must be ${fighters[0]} OR ${fighters[1]}, not both, not neither), then the punchline that references something specific they said. Brutal but light. Maximum 24 words.`;
}
