import { Link, useLocation } from "react-router-dom";
import { BookOpen, Sprout, Star, Sparkles } from "lucide-react";
import { levelFromXp, useProgress } from "../lib/progress.js";

// Sub-navigation shown on every /learn page.
// Converted from storyteller-s-library. The cloud parent-PIN gate needed
// Supabase, so parents use the Elearn /dashboard instead.
// isActive decides which tab is highlighted for the current URL.
const tabs = [
  { to: "/learn", label: "Course", icon: BookOpen, isActive: (path) => path === "/learn" },
  {
    to: "/learn/tracks",
    label: "Adventure paths",
    icon: Sprout,
    // also highlighted on a trail map or a module page
    isActive: (path) => /^\/learn\/(tracks|track\/|module\/)/.test(path),
  },
];

export default function KidNav() {
  const { state } = useProgress();
  const { pathname } = useLocation();

  return (
    <nav className="ln-kidnav" aria-label="Learning navigation">
      <div className="ln-kidnav-brand">
        <span className="glyph" lang="ne" aria-hidden="true">
          ने
        </span>
        <span>
          <b>Nepali course</b>
          <small lang="ne">नेपाली नानीहरू</small>
        </span>
      </div>

      {tabs.map(({ to, label, icon: Icon, isActive }) => {
        const active = isActive(pathname.replace(/\/$/, ""));
        return (
          <Link
            key={to}
            to={to}
            className={`ln-tab ${active ? "active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </Link>
        );
      })}

      <div className="ln-kidnav-stats">
        <span className="ln-badge gold">
          <Star size={13} aria-hidden="true" /> {state.xp} XP
        </span>
        <span className="ln-badge green">
          <Sparkles size={13} aria-hidden="true" /> Level {levelFromXp(state.xp)}
        </span>
      </div>
    </nav>
  );
}
