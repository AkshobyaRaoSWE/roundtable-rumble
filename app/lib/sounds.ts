// Synthesized sound effects via Web Audio API. No assets, no autoplay issues
// (all triggered by user gesture). Honors a global mute toggle.

let _ctx: AudioContext | null = null;
let _muted = false;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (_ctx) return _ctx;
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    _ctx = new Ctor();
  } catch {
    return null;
  }
  return _ctx;
}

const mutedListeners = new Set<() => void>();

// Lets React subscribe to mute changes via useSyncExternalStore.
export function subscribeMuted(cb: () => void): () => void {
  mutedListeners.add(cb);
  return () => mutedListeners.delete(cb);
}

export function setMuted(m: boolean) {
  _muted = m;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("rfh:muted", m ? "1" : "0");
    } catch {}
  }
  mutedListeners.forEach((cb) => cb());
}

export function isMuted(): boolean {
  if (typeof window !== "undefined") {
    try {
      const v = localStorage.getItem("rfh:muted");
      if (v === "1") _muted = true;
      if (v === "0") _muted = false;
    } catch {}
  }
  return _muted;
}

// ────────── individual sounds ──────────

export function sfxFlip() {
  if (_muted) return;
  const c = ctx();
  if (!c) return;
  const dur = 0.32;
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / data.length;
    // exponential decay, with a quick rise
    const env = Math.pow(1 - t, 2.3);
    data[i] = (Math.random() * 2 - 1) * env;
  }
  const noise = c.createBufferSource();
  noise.buffer = buf;

  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.6;
  filter.frequency.setValueAtTime(2400, c.currentTime);
  filter.frequency.exponentialRampToValueAtTime(700, c.currentTime + dur);

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.36, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0008, c.currentTime + dur);

  noise.connect(filter).connect(gain).connect(c.destination);
  noise.start();
  noise.stop(c.currentTime + dur);
}

export function sfxClick() {
  if (_muted) return;
  const c = ctx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(820, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(380, c.currentTime + 0.04);
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(0.18, c.currentTime + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.05);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.06);
}

export function sfxGavel() {
  if (_muted) return;
  const c = ctx();
  if (!c) return;
  for (let i = 0; i < 2; i++) {
    const t0 = c.currentTime + i * 0.18;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, t0);
    osc.frequency.exponentialRampToValueAtTime(55, t0 + 0.12);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.55, t0 + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.18);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + 0.2);

    // crack — short noise on attack
    const dur = 0.05;
    const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let j = 0; j < data.length; j++) {
      const tt = j / data.length;
      data[j] = (Math.random() * 2 - 1) * Math.pow(1 - tt, 4);
    }
    const noise = c.createBufferSource();
    noise.buffer = buf;
    const noiseGain = c.createGain();
    noiseGain.gain.setValueAtTime(0.25, t0);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    noise.connect(noiseGain).connect(c.destination);
    noise.start(t0);
    noise.stop(t0 + dur);
  }
}

export function sfxPop() {
  if (_muted) return;
  const c = ctx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(640, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, c.currentTime + 0.07);
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(0.22, c.currentTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.1);
}

export function sfxApplause() {
  if (_muted) return;
  const c = ctx();
  if (!c) return;
  const dur = 1.2;
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / data.length;
    // rolling clap-like envelope: many small bursts
    const env = Math.pow(1 - t, 1.3);
    const burst = Math.sin(t * 80) > 0.7 ? 1 : 0.4;
    data[i] = (Math.random() * 2 - 1) * env * burst * 0.8;
  }
  const noise = c.createBufferSource();
  noise.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 1100;
  const gain = c.createGain();
  gain.gain.value = 0.22;
  noise.connect(filter).connect(gain).connect(c.destination);
  noise.start();
  noise.stop(c.currentTime + dur);
}
