import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, Globe, MessageCircle } from "lucide-react";
import ProgressBar from "../../components/ProgressBar.jsx";
import { getTracks } from "../../services/mockApi.js";
import { tracks as curriculumTracks } from "../../data/curriculum.js";
import { trackProgress, useProgress } from "../../lib/progress.js";

// /learn — the learning hub: next lesson, both tracks, weekly rhythm.
// Converted from storyteller-s-library (kid.home.tsx).

const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
const trackIcons = { "nepali-language": MessageCircle, "nepali-culture": Globe };

// The last 7 days, oldest first: { date: "YYYY-MM-DD", weekday: 0-6 (Monday = 0) }
function lastSevenDays() {
  const out = [];
  const now = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push({ date: d.toISOString().slice(0, 10), weekday: (d.getDay() + 6) % 7 });
  }
  return out;
}

export default function KidHome({ user }) {
  const { state } = useProgress();
  const [apiTracks, setApiTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load the track list (simulated GET /api/tracks).
  useEffect(() => {
    getTracks()
      .then((res) => setApiTracks(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [state.completedLessons.length]);

  // Next lesson = first unfinished lesson in the first unmastered language module.
  const language = curriculumTracks.find((t) => t.id === "language");
  const modules = language.chapters.flatMap((c) => c.modules);
  const nextModule = modules.find((m) => !state.masteredModules.includes(m.id)) ?? modules[0];
  const nextLesson =
    nextModule.lessons.find((l) => !state.completedLessons.includes(l.id)) ?? nextModule.lessons[0];

  const days = lastSevenDays();
  const learnedDays = days.filter((d) => state.rhythmDays.includes(d.date)).length;
  const name = user?.name?.split(" ")[0] || state.name;

  return (
    <div className="ln-page">
      <div className="ln-home-grid">
        <div className="ln-stack">
          {/* Welcome */}
          <div className="ln-card ln-language tint ln-welcome">
            <img src="/assets/illustrations/yak-mascot.png" alt="Yaju the yak" width="104" height="104" />
            <div>
              <span className="ln-badge gold">Namaste and welcome</span>
              <h1 className="ln-title" style={{ fontSize: "clamp(24px, 3vw, 32px)" }}>
                Ready to learn, {name}?
              </h1>
              <p className="ln-sub">Yaju has packed the bags. Your next lesson is waiting.</p>
            </div>
          </div>

          {/* Next lesson */}
          <div className="ln-card ln-next ln-language">
            <span className="ln-letter-tile" lang="ne" aria-hidden="true">
              {nextModule.items[0]?.np.slice(0, 1) ?? "अ"}
            </span>
            <div className="grow">
              <span className="ln-badge track">Current lesson</span>
              <h2 className="ln-h2">{nextLesson.title}</h2>
              <p className="ln-muted" style={{ margin: 0 }}>
                {nextModule.code}: {nextModule.title}, about {nextLesson.minutes} minutes
              </p>
            </div>
            <Link to={`/learn/lesson/${nextLesson.id}`} className="btn btn-primary">
              Start lesson
            </Link>
          </div>

          {/* Tracks from the (mock) API */}
          {loading ? <p className="ln-loading">Loading your learning paths…</p> : null}
          {error ? <p className="ln-card warn">Could not load learning paths: {error}</p> : null}
          <div className="ln-grid-2">
            {apiTracks.map((track) => {
              const shortId = track.id.replace("nepali-", "");
              const progress = trackProgress(state, shortId);
              const Icon = trackIcons[track.id] ?? Globe;
              return (
                <div key={track.id} className={`ln-card ln-${shortId}`}>
                  <div className="ln-spread">
                    <h3 className="ln-h3">{track.title}</h3>
                    <Icon size={18} className="ic-track" aria-hidden="true" />
                  </div>
                  <p className="ln-muted">{track.description}</p>
                  <div className="ln-progress-label">
                    <span>
                      {track.completedLessons} / {track.totalLessons} lessons
                    </span>
                    <span>
                      {progress.mastered} / {progress.modules} modules
                    </span>
                  </div>
                  <ProgressBar value={progress.pct} label={`${track.title} progress`} />
                  <p style={{ margin: "14px 0 0" }}>
                    <Link to={`/learn/track/${track.id}`} className="ln-link">
                      Open the {shortId} trail
                    </Link>
                  </p>
                </div>
              );
            })}
          </div>

          <Link to="/learn/tracks" className="ln-link">
            Compare both adventure paths
          </Link>
        </div>

        <aside className="ln-stack">
          {/* Weekly rhythm */}
          <div className="ln-card">
            <h3 className="ln-h3">This week</h3>
            <p className="ln-muted">
              You learned on {learnedDays} day{learnedDays === 1 ? "" : "s"} this week. Go at your own pace.
            </p>
            <ul className="ln-week">
              {days.map(({ date, weekday }) => {
                const done = state.rhythmDays.includes(date);
                return (
                  <li key={date}>
                    <span className={`dot ${done ? "on" : ""}`} aria-label={done ? "Learned" : "Rest day"}>
                      {done ? "✿" : "·"}
                    </span>
                    {dayLabels[weekday]}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Encouragement */}
          <div className="ln-card success">
            <div className="ln-row" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
              <Award size={22} className="ic-green" aria-hidden="true" />
              <div>
                <h3 className="ln-h3" style={{ color: "var(--green)" }}>
                  Try another way
                </h3>
                <p className="ln-muted" style={{ margin: "4px 0 0" }}>
                  There are no hearts, lives or timers here. Hints are free and every retry counts as practice.
                </p>
              </div>
            </div>
          </div>

          {!user ? (
            <div className="ln-card reward">
              <h3 className="ln-h3">Save your place</h3>
              <p className="ln-muted">Progress is saved on this device. Create an account to see it on your dashboard.</p>
              <Link to="/signup" className="btn btn-dark btn-sm">
                Create account
              </Link>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
