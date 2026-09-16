import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { BookOpen, X } from "lucide-react";
import LessonEngine from "../../components/LessonEngine.jsx";
import { getLesson } from "../../services/mockApi.js";
import { getChapterOfModule, getLesson as findLesson, getTrackOfChapter } from "../../data/curriculum.js";
import { buildLesson } from "../../lib/exercises.js";
import { useProgress } from "../../lib/progress.js";
import { useAuth } from "../../context/AuthContext.jsx";
import TrackOff from "../../components/TrackOff.jsx";

// /learn/:trackId/lesson/:lessonId — story intro, then the interactive lesson.
// Converted from storyteller-s-library (kid.lesson.$lessonId.tsx).
//
// Data flow:
//   1. mockApi.getLesson()  -> title + storyText (the Sprint 2 API contract)
//   2. local curriculum      -> the vocabulary used to build the practice steps

export default function LessonView() {
  const { trackId, lessonId } = useParams();
  // key={lessonId} gives each lesson a fresh screen when "Next lesson" is clicked.
  return <LessonScreen key={lessonId} trackId={trackId} lessonId={lessonId} />;
}

function LessonScreen({ trackId, lessonId }) {
  const navigate = useNavigate();
  const { state, completeLesson, setLastLesson } = useProgress();
  const { learningRules } = useAuth();
  const [lessonData, setLessonData] = useState(null);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(null); // { flowers, hintsUsed }

  useEffect(() => {
    getLesson(lessonId)
      .then((res) => setLessonData(res.data))
      .catch((err) => setError(err.message));
  }, [lessonId]);

  const found = findLesson(lessonId);
  const realTrack = found ? getTrackOfChapter(getChapterOfModule(found.module.id).id).id : null;
  const allowed = realTrack && learningRules.allowedTracks[realTrack];

  // Remember this lesson for the dashboard's "Continue learning".
  useEffect(() => {
    if (allowed && realTrack === trackId) setLastLesson(realTrack, lessonId);
  }, [allowed, realTrack, trackId, lessonId, setLastLesson]);

  if (error || !found) {
    return (
      <div className="ln-page ln-center">
        <h1 className="ln-title">We could not find that lesson</h1>
        <p className="ln-sub">{error}</p>
        <Link to="/learn" className="btn btn-primary" style={{ marginTop: 16 }}>
          Back to the learning paths
        </Link>
      </div>
    );
  }

  const { lesson, module: mod } = found;
  const track = getTrackOfChapter(getChapterOfModule(mod.id).id);
  // Wrong track in the URL: send to the right one.
  if (track.id !== trackId) return <Navigate to={`/learn/${track.id}/lesson/${lesson.id}`} replace />;
  if (!allowed) return <TrackOff title={track.title} />;
  const moduleHome = `/learn/${track.id}/module/${mod.id}`;
  const index = mod.lessons.findIndex((l) => l.id === lesson.id);
  const exercises = buildLesson(mod, index);
  const nextLesson = mod.lessons[index + 1];

  return (
    <div className={`ln-${track.id}`} style={{ paddingTop: 20 }}>
      <header className="ln-focus-bar">
        <Link to={moduleHome} className="ln-icon-btn" aria-label="Leave the lesson">
          <X size={17} />
        </Link>
        <span className="title">
          {mod.code}, lesson {index + 1}: {lesson.title}
        </span>
        <span className="ln-badge">{lesson.phase}</span>
      </header>

      <div className="ln-page-narrow">
        {!lessonData ? (
          <p className="ln-loading">Loading the lesson…</p>
        ) : finished ? (
          // ----- Finished -----
          <div className="ln-card success">
            <span className="ln-badge green">Lesson complete</span>
            <h1 className="ln-title">
              {finished.flowers} ✿ flowers. Well done, {state.name}!
            </h1>
            <p className="ln-sub">
              You practised: {mod.goal} These words will come back in a story soon.
            </p>
            <div className="ln-row" style={{ marginTop: 20 }}>
              {nextLesson ? (
                <button
                  type="button"
                  className="btn btn-green"
                  onClick={() => navigate(`/learn/${track.id}/lesson/${nextLesson.id}`)}
                >
                  Next lesson
                </button>
              ) : (
                <Link to={`/learn/${track.id}/module/${mod.id}/quest`} className="btn btn-green">
                  Try the module quest
                </Link>
              )}
              <Link to={moduleHome} className="btn btn-ghost">
                Back to the module
              </Link>
            </div>
          </div>
        ) : !started ? (
          // ----- Story intro (from the API) -----
          <div className="ln-card bold">
            <span className="ln-badge track">
              <BookOpen size={13} /> Story time
            </span>
            <h1 className="ln-title">{lessonData.title}</h1>
            <p className="ln-story">{lessonData.storyText}</p>
            <p className="ln-muted" style={{ marginTop: 14 }}>
              {exercises.length} short steps, about {lessonData.minutes} minutes.
            </p>
            <button type="button" className="btn btn-track" onClick={() => setStarted(true)}>
              Start practising
            </button>
          </div>
        ) : (
          // ----- The lesson itself -----
          <LessonEngine
            exercises={exercises}
            romanization={state.romanization}
            reducedMotion={state.reducedMotion}
            allowMic={learningRules.allowSpeaking}
            onFinish={({ flowers, hintsUsed }) => {
              completeLesson(lesson.id, 20);
              setFinished({ flowers, hintsUsed });
            }}
          />
        )}
      </div>
    </div>
  );
}
