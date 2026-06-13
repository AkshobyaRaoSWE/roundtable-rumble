// Streak/score tracking persisted in localStorage. The hook.

const KEY_CUR = "rfh:streak:current";
const KEY_BEST = "rfh:streak:best";
const KEY_TOTAL = "rfh:streak:total";
const KEY_WINS = "rfh:streak:wins";

export type StreakData = {
  current: number;
  best: number;
  total: number;
  wins: number;
};

export const ZERO: StreakData = { current: 0, best: 0, total: 0, wins: 0 };

function readInt(k: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const v = localStorage.getItem(k);
    if (!v) return 0;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function writeInt(k: string, n: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(k, String(n));
  } catch {}
}

export function loadStreak(): StreakData {
  return {
    current: readInt(KEY_CUR),
    best: readInt(KEY_BEST),
    total: readInt(KEY_TOTAL),
    wins: readInt(KEY_WINS),
  };
}

export function recordWin(): StreakData {
  const s = loadStreak();
  const next: StreakData = {
    current: s.current + 1,
    best: Math.max(s.best, s.current + 1),
    total: s.total + 1,
    wins: s.wins + 1,
  };
  writeInt(KEY_CUR, next.current);
  writeInt(KEY_BEST, next.best);
  writeInt(KEY_TOTAL, next.total);
  writeInt(KEY_WINS, next.wins);
  return next;
}

export function recordLoss(): StreakData {
  const s = loadStreak();
  const next: StreakData = {
    current: 0,
    best: s.best,
    total: s.total + 1,
    wins: s.wins,
  };
  writeInt(KEY_CUR, 0);
  writeInt(KEY_TOTAL, next.total);
  return next;
}

// Pull the winner's name out of a verdict line.
// Verdicts look like: "Verdict: Karen wins. Diane the paralegal..."
// We compare against the two fighter names and return whichever appears
// first in the verdict text (case-insensitive).
export function extractWinner(
  verdict: string,
  fighters: [string, string],
): string | null {
  if (!verdict) return null;
  const lower = verdict.toLowerCase();
  const f1 = fighters[0].toLowerCase();
  const f2 = fighters[1].toLowerCase();
  const i1 = lower.indexOf(f1);
  const i2 = lower.indexOf(f2);
  if (i1 === -1 && i2 === -1) return null;
  if (i1 === -1) return fighters[1];
  if (i2 === -1) return fighters[0];
  return i1 < i2 ? fighters[0] : fighters[1];
}
