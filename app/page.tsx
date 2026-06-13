import { DebateView } from "./components/DebateView";
import { SoundToggle } from "./components/SoundToggle";
import { StreakBadge } from "./components/StreakBadge";
import { SHOW_BYLINE } from "./lib/brand";

export default function Home() {
  return (
    <>
      <StreakBadge />
      <SoundToggle />
      <DebateView />
      <footer className="rule mt-auto">
        <div className="max-w-[1180px] mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-2">
          <div className="byline">{SHOW_BYLINE}</div>
          <div className="dateline">Made for laughs &middot; Powered by Groq</div>
        </div>
      </footer>
    </>
  );
}
