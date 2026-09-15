import { Link, useParams } from "react-router-dom";
import { Flower2, Lock, RefreshCw, Sprout } from "lucide-react";
import { bridges, getTrack } from "../../data/curriculum.js";
import { moduleStatus, useProgress } from "../../lib/progress.js";

// /learn/track/:trackId — vertical trail of chapters and their modules.
// trackId can be "nepali-language", "language", "nepali-culture" or "culture".
// Converted from storyteller-s-library (kid.track.$trackId.map.tsx).

const statusIcon = {
  mastered: <Flower2 size={14} className="ic-green" />,
  "in-progress": <RefreshCw size={14} className="ic-gold" />,
  available: <Sprout size={14} className="ic-track" />,
  locked: <Lock size={13} />,
};
const statusText = {
  mastered: "Mastered",
  "in-progress": "In progress",
  available: "Ready",
  locked: "Locked",
};

export default function TrackMap() {
  const { trackId } = useParams();
  const track = getTrack(trackId);
  const { state } = useProgress();

  if (!track) {
    return (
      <div className="ln-page ln-center">
        <h1 className="ln-title">We could not find that path</h1>
        <Link to="/learn/tracks" className="btn btn-primary">
          See all paths
        </Link>
      </div>
    );
  }

  return (
    <div className={`ln-${track.id}`} style={{ paddingTop: 20 }}>
      <div
        className="ln-map-bg"
        style={{ backgroundImage: "url(/assets/illustrations/mountain-trail-bg.jpg)" }}
      >
        <div className="ln-page-narrow">
          <div className="ln-center">
            <span className="ln-badge track" lang="ne">
              {track.nepaliTitle}
            </span>
            <h1 className="ln-title">Chapter trail: {track.title}</h1>
            <p className="ln-sub">{track.tagline}</p>
          </div>

          <ol className="ln-trail">
            {track.chapters.map((chapter) => {
              const mastered = chapter.modules.every((m) => state.masteredModules.includes(m.id));
              const open = chapter.modules.some((m) => moduleStatus(state, m.id) !== "locked");
              return (
                <li key={chapter.id}>
                  <span className={`ln-node ${mastered ? "done" : open ? "open" : ""}`} aria-hidden="true">
                    {mastered ? <Flower2 size={20} /> : open ? <Sprout size={20} /> : <Lock size={18} />}
                  </span>

                  <div className={`ln-card glass ${open || mastered ? "bold" : ""}`}>
                    <div className="ln-row">
                      <span className={`ln-badge ${open ? "track" : ""}`}>{chapter.code}</span>
                      {mastered ? (
                        <span className="ln-badge green">Mastered</span>
                      ) : open ? (
                        <span className="ln-badge gold">Open</span>
                      ) : (
                        <span className="ln-badge">Locked: finish the chapter above first</span>
                      )}
                    </div>
                    <h2 className="ln-h2">
                      {chapter.title}
                      {chapter.nepaliTitle ? (
                        <span lang="ne" className="ln-muted" style={{ marginLeft: 8, fontSize: 16 }}>
                          {chapter.nepaliTitle}
                        </span>
                      ) : null}
                    </h2>
                    <p className="ln-muted">{chapter.summary}</p>

                    <ul className="ln-module-list">
                      {chapter.modules.map((m) => {
                        const status = moduleStatus(state, m.id);
                        const content = (
                          <>
                            <span className="icon">{statusIcon[status]}</span>
                            <span className="name">
                              <b>{m.code}</b> {m.title}
                            </span>
                            <span className="state">{statusText[status]}</span>
                          </>
                        );
                        return (
                          <li key={m.id}>
                            {status === "locked" ? (
                              <span className="ln-module-row locked" aria-disabled="true">
                                {content}
                              </span>
                            ) : (
                              <Link to={`/learn/module/${m.id}`} className="ln-module-row">
                                {content}
                              </Link>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="ln-card reward" style={{ marginTop: 16 }}>
            <span className="ln-badge gold">Optional bridge trail</span>
            <h2 className="ln-h2">Cross-track adventures</h2>
            <p className="ln-muted">
              Bridges open when both paths are ready. They add practice to each side and never unlock a core
              module on their own.
            </p>
            <ul className="ln-bridge-list">
              {bridges.slice(0, 4).map((b) => (
                <li key={b.id}>
                  <b>{b.experience}</b>
                  <p className="ln-muted" style={{ margin: "4px 0 0" }}>
                    Needs {b.languagePrereq} and {b.culturePrereq}. Reward: {b.reward}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
