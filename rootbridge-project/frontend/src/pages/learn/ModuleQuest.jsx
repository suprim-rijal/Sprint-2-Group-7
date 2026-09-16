import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
import LessonEngine from "../../components/LessonEngine.jsx";
import { getChapterOfModule, getModule, getTrackOfChapter } from "../../data/curriculum.js";
import { buildTest } from "../../lib/exercises.js";
import { useProgress } from "../../lib/progress.js";
import { useAuth } from "../../context/AuthContext.jsx";
import TrackOff from "../../components/TrackOff.jsx";

// /learn/:trackId/module/:moduleId/quest — the end-of-module check.
// Finishing it marks the module as "mastered".
// Converted from storyteller-s-library (kid.module.$moduleId.test.tsx).

export default function ModuleQuest() {
  const { trackId, moduleId } = useParams();
  const { state, masterModule } = useProgress();
  const { learningRules } = useAuth();
  const [done, setDone] = useState(null); // { flowers, hintsUsed }
  const mod = getModule(moduleId);

  if (!mod) {
    return (
      <div className="ln-page ln-center">
        <h1 className="ln-title">We could not find that module</h1>
        <Link to="/learn" className="btn btn-primary">
          Back to the learning paths
        </Link>
      </div>
    );
  }

  const track = getTrackOfChapter(getChapterOfModule(mod.id).id);
  if (track.id !== trackId) return <Navigate to={`/learn/${track.id}/module/${mod.id}/quest`} replace />;
  if (!learningRules.allowedTracks[track.id]) return <TrackOff title={track.title} />;
  const moduleHome = `/learn/${track.id}/module/${mod.id}`;
  const exercises = buildTest(mod);

  return (
    <div className={`ln-${track.id}`} style={{ paddingTop: 20 }}>
      <header className="ln-focus-bar">
        <Link to={moduleHome} className="ln-icon-btn" aria-label="Pause and leave the quest">
          <X size={17} />
        </Link>
        <span className="title">
          {mod.code} quest: {mod.title}
        </span>
        <span className="ln-badge">No timer</span>
      </header>

      <div className="ln-page-narrow">
        {done ? (
          <div className="ln-card success">
            <span className="ln-badge green">Quest complete</span>
            <h1 className="ln-title">
              You showed {done.flowers} of {exercises.length} skills, {state.name}.
            </h1>
            <p className="ln-sub">
              Skills practised: {mod.skills.join(", ")}.
              {done.hintsUsed > 0 ? " You used hints. That is how learning works, and nothing was taken away." : ""}
            </p>
            <p className="ln-muted">
              +{mod.xp} XP added. This module now shows as mastered on the trail.
            </p>
            <div className="ln-row" style={{ marginTop: 20 }}>
              <Link to={`/learn/${track.id}`} className="btn btn-green">
                Back to the path
              </Link>
              <Link to={moduleHome} className="btn btn-ghost">
                Back to the module
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="ln-muted" style={{ marginBottom: 20 }}>
              No new words, no timer, no lives. You can leave and come back at any moment.
            </p>
            <LessonEngine
              exercises={exercises}
              quiet
              allowMic={learningRules.allowSpeaking}
              romanization={state.romanization}
              reducedMotion={state.reducedMotion}
              onFinish={(summary) => {
                masterModule(mod.id, mod.xp);
                setDone(summary);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
