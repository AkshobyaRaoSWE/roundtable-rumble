"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import {
  PANELISTS,
  PERSONAS,
  type PersonaId,
} from "@/app/lib/personas";
import { TOPICS, pickSurprise } from "@/app/lib/topics";
import {
  SHOW_NAME,
  SHOW_NAME_LINE_1,
  SHOW_NAME_LINE_2,
  SHOW_TAGLINE,
} from "@/app/lib/brand";
import {
  extractWinner,
  loadStreak,
  recordLoss,
  recordWin,
  type StreakData,
} from "@/app/lib/streak";
import { sfxFlip, sfxClick, sfxGavel, sfxApplause, sfxPop } from "@/app/lib/sounds";
import { getGroqKey, useGroqKey } from "@/app/lib/apiKey";
import { Character } from "./Character";
import { RoundTable, BrawlStage, type Speaker } from "./RoundTable";
import { WinLossReveal } from "./WinLossReveal";
import { ApiKeyModal } from "./ApiKeyModal";

type LaneState = {
  text: string;
  status: Speaker["status"];
};
type DuelTurn = {
  speaker: PersonaId;
  text: string;
  status: Speaker["status"];
};

type ApiMode = "opening" | "duel" | "verdict";

type Phase = "title" | "openings" | "bet" | "brawl" | "verdict";

const initialLanes = (): Record<PersonaId, LaneState> =>
  Object.fromEntries(
    PANELISTS.map((id) => [id, { text: "", status: "pending" as Speaker["status"] }]),
  ) as Record<PersonaId, LaneState>;

function fireConfetti() {
  const defaults = {
    spread: 360, ticks: 100, gravity: 0.5, decay: 0.94, startVelocity: 38,
    colors: ["#c8281e", "#d4a72c", "#1a1411", "#fffaf0", "#2d8a4a"],
  };
  confetti({ ...defaults, particleCount: 90, scalar: 1.2, shapes: ["circle"], origin: { x: 0.5, y: 0.55 } });
  setTimeout(() => {
    confetti({ ...defaults, particleCount: 50, origin: { x: 0.15, y: 0.6 } });
    confetti({ ...defaults, particleCount: 50, origin: { x: 0.85, y: 0.6 } });
  }, 200);
}

export function DebateView() {
  const [topic, setTopic] = useState("");
  const [activeTopic, setActiveTopic] = useState("");
  const [phase, setPhase] = useState<Phase>("title");

  const [openings, setOpenings] = useState<Record<PersonaId, LaneState>>(initialLanes());
  const [picks, setPicks] = useState<PersonaId[]>([]);
  const [bet, setBet] = useState<PersonaId | null>(null);
  const [fighters, setFighters] = useState<[PersonaId, PersonaId] | null>(null);
  const [duelTurns, setDuelTurns] = useState<DuelTurn[]>([]);
  const [verdict, setVerdict] = useState<{ text: string; status: Speaker["status"] }>({
    text: "", status: "pending",
  });
  const [outcome, setOutcome] = useState<{
    result: "win" | "loss" | null;
    actualWinner: string | null;
    streakAfter: StreakData;
  }>({ result: null, actualWinner: null, streakAfter: loadStreak() });

  const [toast, setToast] = useState<string | null>(null);
  const groqKey = useGroqKey();
  const [keyModalOpen, setKeyModalOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const duelTurnsRef = useRef<DuelTurn[]>([]);
  // Mirror duelTurns into a ref (read by the async brawl loop) after commit,
  // not during render.
  useEffect(() => {
    duelTurnsRef.current = duelTurns;
  }, [duelTurns]);
  const verdictResolvedRef = useRef(false);

  // ──────── streaming ────────
  const streamOnce = useCallback(
    async (
      payload: {
        character: PersonaId;
        topic: string;
        mode: ApiMode;
        context?: { name: string; text: string }[];
        opponent?: string;
        fighters?: string[];
      },
      onChunk: (acc: string) => void,
      signal: AbortSignal,
    ): Promise<{ text: string; ok: boolean }> => {
      try {
        const res = await fetch("/api/debate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-groq-key": getGroqKey(),
          },
          body: JSON.stringify(payload),
          signal,
        });
        if (!res.ok || !res.body) {
          const err = await res.text().catch(() => "stream failed");
          onChunk(err);
          return { text: err, ok: false };
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          onChunk(acc);
        }
        return { text: acc.trim(), ok: true };
      } catch (e) {
        if (signal.aborted) return { text: "", ok: false };
        const msg = e instanceof Error ? e.message : "error";
        onChunk(msg);
        return { text: msg, ok: false };
      }
    },
    [],
  );

  // ──────── openings: parallel ────────
  const playOpenings = useCallback(
    async (signal: AbortSignal) => {
      // Mark all as streaming
      setOpenings((prev) => {
        const next = { ...prev };
        for (const id of PANELISTS) next[id] = { text: "", status: "streaming" };
        return next;
      });

      await Promise.allSettled(
        PANELISTS.map(async (id) => {
          const result = await streamOnce(
            { character: id, topic: activeTopic, mode: "opening" },
            (acc) =>
              setOpenings((prev) => ({
                ...prev,
                [id]: { text: acc, status: "streaming" },
              })),
            signal,
          );
          if (signal.aborted) return;
          setOpenings((prev) => ({
            ...prev,
            [id]: { text: result.text, status: result.ok ? "done" : "error" },
          }));
        }),
      );
    },
    [activeTopic, streamOnce],
  );

  // ──────── brawl reel ────────
  const playBrawl = useCallback(
    async (signal: AbortSignal) => {
      if (!fighters) return;
      const [A, B] = fighters;
      const order: PersonaId[] = [A, B, A, B, A, B];

      const seedContext: { name: string; text: string }[] = [
        { name: PERSONAS[A].name, text: openings[A].text },
        { name: PERSONAS[B].name, text: openings[B].text },
      ];

      // initialize all turns as pending if not already
      setDuelTurns(
        order.map((sp) => ({ speaker: sp, text: "", status: "pending" as const })),
      );

      for (let i = 0; i < order.length; i++) {
        if (signal.aborted) return;
        const speaker = order[i];
        const opponent = speaker === A ? B : A;

        const liveContext = [...seedContext];
        for (let j = 0; j < i; j++) {
          const t = duelTurnsRef.current[j];
          if (t?.text) liveContext.push({ name: PERSONAS[t.speaker].name, text: t.text });
        }

        setDuelTurns((prev) => {
          const next = [...prev];
          next[i] = { ...next[i], status: "streaming" };
          return next;
        });

        if (i > 0) await new Promise((r) => setTimeout(r, 600));

        const result = await streamOnce(
          {
            character: speaker,
            topic: activeTopic,
            mode: "duel",
            opponent: PERSONAS[opponent].name,
            context: liveContext,
          },
          (acc) =>
            setDuelTurns((prev) => {
              const next = [...prev];
              next[i] = { ...next[i], text: acc, status: "streaming" };
              return next;
            }),
          signal,
        );

        setDuelTurns((prev) => {
          const next = [...prev];
          next[i] = {
            ...next[i],
            text: result.text,
            status: result.ok ? "done" : "error",
          };
          return next;
        });
      }
    },
    [fighters, openings, activeTopic, streamOnce],
  );

  // ──────── verdict ────────
  const playVerdict = useCallback(
    async (signal: AbortSignal) => {
      if (!fighters) return;
      const [A, B] = fighters;
      setVerdict({ text: "", status: "streaming" });
      sfxGavel();

      const seedContext: { name: string; text: string }[] = [
        { name: PERSONAS[A].name, text: openings[A].text },
        { name: PERSONAS[B].name, text: openings[B].text },
      ];
      const verdictContext: { name: string; text: string }[] = [
        ...seedContext,
        ...duelTurnsRef.current.map((t) => ({
          name: PERSONAS[t.speaker].name,
          text: t.text,
        })),
      ];
      const vResult = await streamOnce(
        {
          character: "host",
          topic: activeTopic,
          mode: "verdict",
          fighters: [PERSONAS[A].name, PERSONAS[B].name],
          context: verdictContext,
        },
        (acc) => setVerdict({ text: acc, status: "streaming" }),
        signal,
      );
      setVerdict({ text: vResult.text, status: vResult.ok ? "done" : "error" });

      // Resolve outcome
      if (vResult.ok && !verdictResolvedRef.current && bet) {
        verdictResolvedRef.current = true;
        const actual = extractWinner(vResult.text, [
          PERSONAS[A].name,
          PERSONAS[B].name,
        ]);
        const predictedName = PERSONAS[bet].name;
        if (actual && actual.toLowerCase() === predictedName.toLowerCase()) {
          const next = recordWin();
          setOutcome({ result: "win", actualWinner: actual, streakAfter: next });
          await new Promise((r) => setTimeout(r, 220));
          fireConfetti();
          sfxApplause();
        } else {
          const next = recordLoss();
          setOutcome({
            result: "loss",
            actualWinner: actual,
            streakAfter: next,
          });
        }
      }
    },
    [fighters, openings, activeTopic, streamOnce, bet],
  );

  // ──────── effect: drive each phase ────────
  useEffect(() => {
    if (phase === "title") return;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    (async () => {
      if (phase === "openings") {
        await playOpenings(ctrl.signal);
      } else if (phase === "brawl") {
        await playBrawl(ctrl.signal);
      } else if (phase === "verdict") {
        await playVerdict(ctrl.signal);
      }
    })();

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ──────── flow ────────
  const start = useCallback((rawTopic: string) => {
    const t = rawTopic.trim();
    if (!t) return;
    // Bring-your-own-key: no key, no debate — open the key modal instead.
    if (!getGroqKey()) {
      setKeyModalOpen(true);
      return;
    }
    sfxClick();
    abortRef.current?.abort();
    setActiveTopic(t);
    setOpenings(initialLanes());
    setPicks([]);
    setBet(null);
    setFighters(null);
    setDuelTurns([]);
    setVerdict({ text: "", status: "pending" });
    setOutcome({ result: null, actualWinner: null, streakAfter: loadStreak() });
    verdictResolvedRef.current = false;
    setPhase("openings");
  }, []);

  const togglePick = useCallback(
    (id: PersonaId) => {
      sfxPop();
      setPicks((prev) => {
        if (prev.includes(id)) {
          if (bet === id) setBet(null);
          return prev.filter((x) => x !== id);
        }
        if (prev.length >= 2) return prev;
        return [...prev, id];
      });
    },
    [bet],
  );

  const setBetWith = useCallback(
    (id: PersonaId) => {
      if (!picks.includes(id)) return;
      sfxClick();
      setBet(id);
    },
    [picks],
  );

  const advanceToBet = useCallback(() => {
    sfxFlip();
    setPhase("bet");
  }, []);

  const advanceToBrawl = useCallback(() => {
    if (picks.length !== 2 || !bet) return;
    sfxFlip();
    setFighters([picks[0], picks[1]]);
    setPhase("brawl");
  }, [picks, bet]);

  const advanceToVerdict = useCallback(() => {
    sfxFlip();
    setPhase("verdict");
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setPhase("title");
    setActiveTopic("");
    setTopic("");
    setOpenings(initialLanes());
    setPicks([]);
    setBet(null);
    setFighters(null);
    setDuelTurns([]);
    setVerdict({ text: "", status: "pending" });
    setOutcome({ result: null, actualWinner: null, streakAfter: loadStreak() });
    verdictResolvedRef.current = false;
  }, []);

  const surprise = useCallback(() => {
    sfxClick();
    const t = pickSurprise();
    setTopic(t);
    start(t);
  }, [start]);

  const shareOutcome = useCallback(async () => {
    if (!verdict.text) return;
    const streak = outcome.streakAfter;
    const callBit =
      outcome.result === "win"
        ? `🔥 ${streak.current} in a row.`
        : `Streak broken at ${streak.best}. I bet ${PERSONAS[bet ?? "chad"].name}, Host called ${outcome.actualWinner ?? "no one"}.`;
    const shareText = `${SHOW_NAME} — they argued "${activeTopic}".\n\n${verdict.text}\n\n${callBit}`;
    const url = typeof window !== "undefined" ? window.location.origin : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: SHOW_NAME,
          text: shareText,
          url,
        });
        setToast("Shared.");
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${url}`);
        setToast("Copied to clipboard.");
        fireConfetti();
      }
      setTimeout(() => setToast(null), 1800);
    } catch {}
  }, [verdict.text, activeTopic, outcome, bet]);

  // Speakers map for round-table component
  const speakersForTable = useMemo<Record<PersonaId, Speaker>>(() => {
    return Object.fromEntries(
      PANELISTS.map((id) => [
        id,
        { id, text: openings[id].text, status: openings[id].status },
      ]),
    ) as Record<PersonaId, Speaker>;
  }, [openings]);

  const allOpeningsDone = PANELISTS.every(
    (id) => openings[id].status === "done" || openings[id].status === "error",
  );

  const brawlDone =
    duelTurns.length === 6 &&
    duelTurns.every((t) => t.status === "done" || t.status === "error");

  return (
    <>
      {phase === "title" && (
        <TitleScreen
          topic={topic}
          setTopic={setTopic}
          onSubmit={() => start(topic)}
          onPick={(t) => {
            setTopic(t);
            start(t);
          }}
          onSurprise={surprise}
          hasKey={!!groqKey}
          onOpenKey={() => setKeyModalOpen(true)}
        />
      )}

      {phase === "openings" && (
        <OpeningsScene
          topic={activeTopic}
          speakers={speakersForTable}
          allDone={allOpeningsDone}
          onContinue={advanceToBet}
          onReset={reset}
        />
      )}

      {phase === "bet" && (
        <BetScene
          topic={activeTopic}
          openings={openings}
          picks={picks}
          bet={bet}
          onTogglePick={togglePick}
          onSetBet={setBetWith}
          onContinue={advanceToBrawl}
          onReset={reset}
        />
      )}

      {phase === "brawl" && fighters && (
        <BrawlScene
          fighters={fighters}
          turns={duelTurns}
          done={brawlDone}
          bet={bet}
          onContinue={advanceToVerdict}
          onReset={reset}
        />
      )}

      {phase === "verdict" && (
        <VerdictScene
          verdict={verdict}
          bet={bet}
          outcome={outcome}
          onShare={shareOutcome}
          onReset={reset}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-[var(--ink)] text-[var(--paper-2)] text-[12px] font-bold tracking-[0.18em] uppercase shadow-2xl scale-in rounded-full">
          {toast}
        </div>
      )}

      <ApiKeyModal open={keyModalOpen} onClose={() => setKeyModalOpen(false)} />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════
// TITLE SCREEN
// ════════════════════════════════════════════════════════════════════

function TitleScreen({
  topic,
  setTopic,
  onSubmit,
  onPick,
  onSurprise,
  hasKey,
  onOpenKey,
}: {
  topic: string;
  setTopic: (s: string) => void;
  onSubmit: () => void;
  onPick: (t: string) => void;
  onSurprise: () => void;
  hasKey: boolean;
  onOpenKey: () => void;
}) {
  return (
    <main className="flex-1 flex flex-col px-5 sm:px-10 py-10 max-w-[1200px] mx-auto w-full">
      <header className="text-center mb-12">
        <h1 className="display text-[80px] sm:text-[120px] md:text-[160px] leading-[0.92] text-[var(--ink)]">
          {SHOW_NAME_LINE_1}
        </h1>
        <h1 className="display text-[52px] sm:text-[80px] md:text-[104px] leading-none text-[var(--red)] -mt-3 italic">
          {SHOW_NAME_LINE_2}
        </h1>
        <p className="deck mt-6 max-w-md mx-auto">{SHOW_TAGLINE}</p>
      </header>

      {/* Cast preview */}
      <div className="flex justify-center items-end gap-2 sm:gap-4 mb-12 fade-rise">
        {PANELISTS.map((id, i) => (
          <div
            key={id}
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
            className="scale-in flex flex-col items-center"
          >
            <Character id={id} mood="idle" size={120} />
            <div className="character-nameplate mt-1">{PERSONAS[id].name}</div>
          </div>
        ))}
      </div>

      <section className="max-w-2xl mx-auto w-full mb-14">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="type a topic… is cereal a soup"
            className="input-game mb-5"
            maxLength={200}
            autoFocus
          />
          <div className="flex items-center gap-4 justify-center flex-wrap">
            <button type="submit" disabled={!topic.trim()} className="btn-game">
              Convene the Panel
            </button>
            <button type="button" onClick={onSurprise} className="btn-shuffle">
              🎲 Surprise me
            </button>
          </div>
          <div className="text-center mt-4">
            <button type="button" onClick={onOpenKey} className="btn-text">
              {hasKey
                ? "🔑 Groq API key set · change"
                : "🔑 Add your free Groq API key to start"}
            </button>
          </div>
        </form>
      </section>

      <section className="max-w-2xl mx-auto w-full">
        <div className="kicker mb-3 text-center">Or pick a hot topic</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TOPICS.slice(0, 8).map((t) => (
            <button
              key={t.topic}
              onClick={() => onPick(t.topic)}
              className="text-left px-4 py-3 rounded-lg border-2 border-[var(--ink)] bg-[var(--paper-2)] hover:bg-[var(--gold)] transition shadow-[0_3px_0_var(--ink)] hover:translate-y-[-2px] hover:shadow-[0_5px_0_var(--ink)] active:translate-y-[1px] active:shadow-[0_2px_0_var(--ink)] font-medium"
            >
              {t.topic}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

// ════════════════════════════════════════════════════════════════════
// OPENINGS SCENE — round table view
// ════════════════════════════════════════════════════════════════════

function OpeningsScene({
  topic,
  speakers,
  allDone,
  onContinue,
  onReset,
}: {
  topic: string;
  speakers: Record<PersonaId, Speaker>;
  allDone: boolean;
  onContinue: () => void;
  onReset: () => void;
}) {
  return (
    <main className="flex-1 flex flex-col px-4 sm:px-8 py-6 max-w-[1100px] mx-auto w-full">
      <SceneHeader subtitle="Act I — The Opening Statements" onReset={onReset} />
      <RoundTable topic={topic} speakers={speakers} />
      <div className="text-center mt-8">
        <button
          onClick={onContinue}
          disabled={!allDone}
          className="btn-game"
          title={allDone ? "Pick your fighters" : "Wait for everyone to speak"}
        >
          {allDone ? "Place Your Bet →" : "Listening…"}
        </button>
      </div>
    </main>
  );
}

// ════════════════════════════════════════════════════════════════════
// BET SCENE
// ════════════════════════════════════════════════════════════════════

function BetScene({
  topic,
  openings,
  picks,
  bet,
  onTogglePick,
  onSetBet,
  onContinue,
  onReset,
}: {
  topic: string;
  openings: Record<PersonaId, LaneState>;
  picks: PersonaId[];
  bet: PersonaId | null;
  onTogglePick: (id: PersonaId) => void;
  onSetBet: (id: PersonaId) => void;
  onContinue: () => void;
  onReset: () => void;
}) {
  return (
    <main className="flex-1 flex flex-col px-4 sm:px-8 py-6 max-w-[1100px] mx-auto w-full">
      <SceneHeader subtitle={`On: "${topic}"`} onReset={onReset} />

      <header className="text-center mb-6 scale-in">
        <div className="kicker mb-2">Step 1</div>
        <h2 className="headline text-[36px] sm:text-[52px]">Pick two to brawl</h2>
      </header>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-10 max-w-3xl mx-auto w-full">
        {PANELISTS.map((id) => {
          const p = PERSONAS[id];
          const picked = picks.includes(id);
          const isBet = bet === id;
          const disabled = !picked && picks.length >= 2;
          return (
            <button
              key={id}
              onClick={() => onTogglePick(id)}
              disabled={disabled}
              className={`bet-card ${picked ? "picked" : ""} ${isBet ? "bet" : ""}`}
              style={
                picked
                  ? {
                      borderColor: p.accent,
                      boxShadow: `0 6px 0 ${p.accent}`,
                    }
                  : undefined
              }
            >
              <div className="flex justify-center">
                <Character id={id} mood={picked ? "spot" : "idle"} size={90} />
              </div>
              <div className="bet-card-name" style={{ color: p.accent }}>
                {p.name}
              </div>
              <div className="bet-card-tag">{p.tagline}</div>
              <div className="bet-card-quote">
                {openings[id]?.text
                  ? `"${openings[id].text.slice(0, 80)}${openings[id].text.length > 80 ? "…" : ""}"`
                  : ""}
              </div>
            </button>
          );
        })}
      </div>

      {picks.length === 2 && (
        <div className="text-center fade-rise">
          <div className="kicker mb-2">Step 2</div>
          <h3 className="headline text-[28px] sm:text-[40px] mb-4">
            Who survives?
          </h3>
          <p className="deck mb-6 max-w-md mx-auto">
            Tap your pick. Right answer extends your streak. Wrong burns it.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {picks.map((id) => {
              const p = PERSONAS[id];
              const isBet = bet === id;
              return (
                <button
                  key={id}
                  onClick={() => onSetBet(id)}
                  className={`bet-card picked ${isBet ? "bet" : ""}`}
                  style={{
                    borderColor: isBet ? "var(--gold)" : p.accent,
                    boxShadow: isBet ? "0 6px 0 var(--gold)" : `0 6px 0 ${p.accent}`,
                    minWidth: 200,
                  }}
                >
                  {isBet && <div className="bet-card-crown">👑 Your Bet</div>}
                  <div className="flex justify-center">
                    <Character id={id} mood={isBet ? "spot" : "idle"} size={120} />
                  </div>
                  <div className="bet-card-name" style={{ color: p.accent }}>
                    {p.name}
                  </div>
                </button>
              );
            })}
          </div>
          <button
            onClick={onContinue}
            disabled={!bet}
            className="btn-game btn-game-gold"
          >
            {bet ? "Lock It In · Brawl Time →" : "Pick a winner first"}
          </button>
        </div>
      )}
    </main>
  );
}

// ════════════════════════════════════════════════════════════════════
// BRAWL SCENE
// ════════════════════════════════════════════════════════════════════

function BrawlScene({
  fighters,
  turns,
  done,
  bet,
  onContinue,
  onReset,
}: {
  fighters: [PersonaId, PersonaId];
  turns: DuelTurn[];
  done: boolean;
  bet: PersonaId | null;
  onContinue: () => void;
  onReset: () => void;
}) {
  return (
    <main className="flex-1 flex flex-col px-4 sm:px-8 py-6 max-w-[1100px] mx-auto w-full">
      <SceneHeader subtitle="Act II — The Brawl" onReset={onReset} />
      {bet && (
        <div className="text-center mb-3">
          <div className="kicker">
            🎯 Your bet: <span style={{ color: PERSONAS[bet].accent }}>{PERSONAS[bet].name}</span>
          </div>
        </div>
      )}
      <BrawlStage fighters={fighters} turns={turns} />
      <div className="text-center mt-6">
        <button
          onClick={onContinue}
          disabled={!done}
          className="btn-game"
        >
          {done ? "Hear the Verdict →" : "Watching the brawl…"}
        </button>
      </div>
    </main>
  );
}

// ════════════════════════════════════════════════════════════════════
// VERDICT SCENE
// ════════════════════════════════════════════════════════════════════

function VerdictScene({
  verdict,
  bet,
  outcome,
  onShare,
  onReset,
}: {
  verdict: { text: string; status: Speaker["status"] };
  bet: PersonaId | null;
  outcome: { result: "win" | "loss" | null; actualWinner: string | null; streakAfter: StreakData };
  onShare: () => void;
  onReset: () => void;
}) {
  const verdictDone = verdict.status === "done" && verdict.text;
  return (
    <main className="flex-1 flex flex-col px-4 sm:px-8 py-6 max-w-[900px] mx-auto w-full">
      <SceneHeader subtitle="Act III — The Verdict" onReset={onReset} />

      <div className="relative mt-8 mb-8 host-drop-in" style={{ position: "static" }}>
        <div className="flex flex-col items-center">
          <div className="character-nameplate">The Host</div>
          <Character id="host" mood={verdict.status === "streaming" ? "speaking" : "spot"} size={180} />
          <div className="speech-bubble bubble--lg mt-4 verdict-drop">
            <div className="speech-bubble__inner display text-[24px] sm:text-[32px] leading-tight">
              {verdict.text || (
                <span className="italic opacity-50 text-[16px] not-italic">
                  the host clears his throat…
                </span>
              )}
              {verdict.status === "streaming" && <span className="cursor" />}
            </div>
            <div className="speech-bubble__tail tail--down" />
          </div>
        </div>
      </div>

      {verdictDone && outcome.result !== null && (
        <div className="mt-6">
          <WinLossReveal
            result={outcome.result}
            predicted={bet ? PERSONAS[bet].name : null}
            actual={outcome.actualWinner}
            streak={outcome.streakAfter}
          />
          <div className="mt-10 text-center space-y-5">
            <button onClick={onShare} className="btn-game btn-game-gold">
              {outcome.result === "win" ? "Share My Streak 🔥" : "Share This Verdict"}
            </button>
            <div>
              <button onClick={onReset} className="btn-game">
                🎲 New Debate
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ════════════════════════════════════════════════════════════════════
// SCENE HEADER
// ════════════════════════════════════════════════════════════════════

function SceneHeader({ subtitle, onReset }: { subtitle: string; onReset: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
      <button onClick={onReset} className="btn-text">
        ← New Topic
      </button>
      <div className="dateline">{subtitle}</div>
    </div>
  );
}
