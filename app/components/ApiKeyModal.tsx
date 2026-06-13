"use client";

import { useState } from "react";
import { clearGroqKey, getGroqKey, setGroqKey } from "@/app/lib/apiKey";

export function ApiKeyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return <ApiKeyModalInner onClose={onClose} />;
}

function ApiKeyModalInner({ onClose }: { onClose: () => void }) {
  // Mounts fresh each time it opens, so a lazy initializer is enough — no effect.
  const [value, setValue] = useState(() => getGroqKey());
  const hadKey = getGroqKey().length > 0;
  const looksValid = value.trim().startsWith("gsk_");

  function save() {
    setGroqKey(value);
    onClose();
  }

  function remove() {
    clearGroqKey();
    setValue("");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[var(--paper-2)] border-2 border-[var(--ink)] rounded-2xl shadow-[0_10px_0_var(--ink)] p-7 scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="kicker mb-1">Bring your own key</div>
        <h2 className="headline text-[30px] mb-3">Add your Groq API key</h2>
        <p className="deck text-[14px] mb-5">
          Debates run on Groq. Grab a free key at{" "}
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold text-[var(--red)]"
          >
            console.groq.com
          </a>
          . It is stored only in your browser and sent only to run your debates.
        </p>

        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="gsk_..."
          className="input-game mb-2"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && looksValid) save();
          }}
        />
        {value.trim() && !looksValid && (
          <div className="text-[12px] text-[var(--red)] font-semibold mb-3">
            Groq keys start with “gsk_”. Double-check you copied the whole thing.
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mt-4 flex-wrap">
          <div className="flex gap-3">
            <button onClick={save} disabled={!looksValid} className="btn-game">
              Save key
            </button>
            <button onClick={onClose} className="btn-text">
              Cancel
            </button>
          </div>
          {hadKey && (
            <button onClick={remove} className="btn-text text-[var(--red)]">
              Remove key
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
