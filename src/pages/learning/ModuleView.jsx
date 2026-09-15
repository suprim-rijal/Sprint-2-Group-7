import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Circle } from "lucide-react";
import ProgressBar from "../../components/ProgressBar.jsx";
import { getChapterOfModule, getModule, getTrackOfChapter } from "../../data/curriculum.js";
import { moduleProgress, moduleStatus, useProgress } from "../../lib/progress.js";

// /learn/module/:moduleId — the lessons in one module, its words, and the quest.
// Converted from storyteller-s-library (kid.module.$moduleId.tsx).

export default function ModuleView() {
  const { moduleId } = useParams();
  const { state } = useProgress();
  const mod = getModule(moduleId);

  if (!mod) {
    return (
      <div className="ln-page ln-center">
        <h1 className="ln-title">We could not find that module</h1>
        <Link to="/learn/tracks" className="btn btn-primary">
          See all paths
        </Link>
      </div>
    );
  }

  const chapter = getChapterOfModule(mod.id);
  const track = getTrackOfChapter(chapter.id);
  const progress = moduleProgress(state, mod.id);
  const mastered = moduleStatus(state, mod.id) === "mastered";
  // The quest opens when all lessons but one are done.
  const questReady = progress.done >= mod.lessons.length - 1;

  return (
    <div className={`ln-page-narrow ln-${track.id}`}>
      <Link to={`/learn/track/nepali-${track.id}`} className="ln-back">
        ← {chapter.code}: {chapter.title}
      </Link>

      <div className="ln-card bold">
        <div className="ln-row">
          <span className="ln-badge track">{mod.code}</span>
          <span className="ln-badge gold">{mod.xp} XP</span>
          <span className="ln-badge">{mod.testTasks}-task quest</span>
          {mastered ? <span className="ln-badge green">Mastered</span> : null}
        </div>
        <h1 className="ln-title">{mod.title}</h1>
        <p className="ln-sub">
          <b>What you will be able to do: </b>
          {mod.goal}
        </p>

        <div className="ln-progress-label">
          <span>Lessons done</span>
          <span>
            {progress.done} / {progress.total}
          </span>
        </div>
        <ProgressBar value={progress.pct} label="Module progress" />

        <p className="ln-muted" style={{ marginTop: 18, marginBottom: 0, fontWeight: 700 }}>
          Words in this module
        </p>
        <div className="ln-vocab">
          {mod.items.map((item) => (
            <span key={item.np} title={item.en}>
              <span lang="ne">{item.np}</span>
              <small>{item.rom}</small>
            </span>
          ))}
        </div>

        {mod.note ? (
          <p className="ln-instructions" style={{ fontSize: 13 }}>
            {mod.note}
          </p>
        ) : null}
      </div>

      <div className="ln-stack" style={{ marginTop: 22 }}>
        {mod.lessons.map((lesson, i) => {
          const done = state.completedLessons.includes(lesson.id);
          return (
            <Link key={lesson.id} to={`/learn/lesson/${lesson.id}`} className="ln-card ln-lesson-row">
              <span className="ln-lesson-num">{i + 1}</span>
              <span className="grow">
                <span className="ln-h3" style={{ display: "block" }}>
                  {lesson.title}
                </span>
                <span className="ln-muted">
                  {lesson.phase}, about {lesson.minutes} minutes
                </span>
              </span>
              {done ? (
                <CheckCircle2 size={24} className="ic-green" aria-label="Done" />
              ) : (
                <Circle size={24} color="var(--line)" aria-label="Not done yet" />
              )}
            </Link>
          );
        })}

        <div className="ln-card reward ln-spread" style={{ flexWrap: "wrap" }}>
          <div>
            <h2 className="ln-h3">Module quest</h2>
            <p className="ln-muted" style={{ margin: "4px 0 0" }}>
              {mod.testTasks} mixed tasks, no timer, no new words. You can pause any time.
            </p>
          </div>
          {questReady ? (
            <Link to={`/learn/module/${mod.id}/quest`} className="btn btn-primary btn-sm">
              {mastered ? "Play the quest again" : "Start the quest"}
            </Link>
          ) : (
            <button type="button" className="btn btn-primary btn-sm" disabled>
              Finish the lessons first
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
