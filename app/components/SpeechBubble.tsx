"use client";

// Comic-style speech bubble that pops above a character.
// Tail position controlled by `tail` prop ("down" / "down-left" / "down-right").
export function SpeechBubble({
  children,
  tail = "down",
  isStreaming = false,
  accent = "#1a1411",
  size = "md",
}: {
  children: React.ReactNode;
  tail?: "down" | "down-left" | "down-right";
  isStreaming?: boolean;
  accent?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = size === "sm" ? "bubble--sm" : size === "lg" ? "bubble--lg" : "bubble--md";
  return (
    <div
      className={`speech-bubble ${sizeClass}`}
      style={{ borderColor: accent }}
    >
      <div className="speech-bubble__inner">
        {children}
        {isStreaming && <span className="cursor" />}
      </div>
      <div
        className={`speech-bubble__tail tail--${tail}`}
        style={{ borderTopColor: accent }}
      />
    </div>
  );
}
