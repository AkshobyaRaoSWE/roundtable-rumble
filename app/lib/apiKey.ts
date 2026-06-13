"use client";

// The user's own Groq API key, kept in localStorage and sent with each debate
// request. It never leaves the browser except to this app's own API route, which
// forwards it to Groq for that request and never stores it.

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "rr:groqKey";
const listeners = new Set<() => void>();

export function getGroqKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setGroqKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } catch {}
  listeners.forEach((fn) => fn());
}

export function clearGroqKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  listeners.forEach((fn) => fn());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

// Reactive read of the stored key (a primitive string, SSR-safe).
export function useGroqKey(): string {
  return useSyncExternalStore(subscribe, getGroqKey, () => "");
}
