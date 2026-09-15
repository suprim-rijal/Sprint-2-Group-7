import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import ProgressBar from "../../components/ProgressBar.jsx";
import { getTracks } from "../../services/mockApi.js";
import { getTrack } from "../../data/curriculum.js";
import { trackProgress, useProgress } from "../../lib/progress.js";

// /learn/tracks — choose the Language path or the Culture path.
// Converted from storyteller-s-library (kid.tracks.tsx).

const art = {
  language: "/assets/illustrations/track-language.jpg",
  culture: "/assets/illustrations/track-culture.jpg",
};
const buttonText = { language: "Explore sounds", culture: "Begin the journey" };

export default function TrackSelect() {
  const { state } = useProgress();
  const [apiTracks, setApiTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTracks()
      .then((res) => setApiTracks(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="ln-page">
      <div className="ln-center">
        <h1 className="ln-title">Choose your adventure path</h1>
        <p className="ln-sub">Two separate paths. You always know which one you are learning.</p>
      </div>

      {loading ? <p className="ln-loading">Loading learning paths…</p> : null}

      <div className="ln-grid-2" style={{ marginTop: 32 }}>
        {apiTracks.map((apiTrack) => {
          // API gives the summary, local curriculum gives chapters and modules.
          const track = getTrack(apiTrack.id);
          if (!track) return null;
          const progress = trackProgress(state, track.id);
          const current =
            track.chapters.find((c) => c.modules.some((m) => !state.masteredModules.includes(m.id))) ??
            track.chapters[0];

          return (
            <div key={apiTrack.id} className={`ln-card bold ln-${track.id}`}>
              <div className="ln-track-art">
                <img src={art[track.id]} alt="" loading="lazy" width="1024" height="640" />
              </div>

              <h2 className="ln-h2" style={{ marginTop: 18 }}>
                <span lang="ne">{track.nepaliTitle}</span> / {apiTrack.title}
              </h2>
              <p className="ln-muted">{apiTrack.description}</p>

              <div className="ln-current">
                <small>Current chapter</small>
                <b>
                  {current.code}: {current.title}
                </b>
              </div>

              <p className="ln-muted" style={{ marginTop: 16, marginBottom: 0, fontWeight: 700 }}>
                What you will learn next:
              </p>
              <ul className="ln-checklist">
                {current.modules.slice(0, 3).map((m) => (
                  <li key={m.id}>
                    <Check size={16} aria-hidden="true" />
                    {m.goal}
                  </li>
                ))}
              </ul>

              <div className="ln-progress-label">
                <span>
                  {track.chapters.length} chapters, {progress.modules} modules
                </span>
                <span>
                  {apiTrack.completedLessons} / {apiTrack.totalLessons} lessons
                </span>
              </div>
              <ProgressBar value={progress.pct} label={`${apiTrack.title} progress`} />

              <Link to={`/learn/track/${apiTrack.id}`} className="btn btn-track btn-block" style={{ marginTop: 22 }}>
                {buttonText[track.id]}
              </Link>
            </div>
          );
        })}
      </div>

      <p className="ln-center" style={{ marginTop: 28 }}>
        <span className="ln-badge green">No hearts, no lives, no timers, unlimited retries</span>
      </p>
    </div>
  );
}
