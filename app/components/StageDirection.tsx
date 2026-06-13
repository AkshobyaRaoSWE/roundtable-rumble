"use client";

// Italic centered narrator beat. Used between speakers and acts.
export function StageDirection({ children }: { children: React.ReactNode }) {
  return (
    <p className="stage-direction fade-in">
      {children}
    </p>
  );
}
