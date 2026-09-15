// Learner progress, saved in the browser (localStorage).
// Converted from storyteller-s-library. The Supabase cloud sync was removed
// because Sprint 2 frontend must work with no server at all.
//
// How it works, step by step:
// 1. read() loads the saved progress object from localStorage (or the defaults).
// 2. useProgress() keeps that object in React state.
// 3. Every change is written back to localStorage AND announced with a
//    browser event, so other components on the page (like the KidNav XP chip)
//    update at the same time.

import { useCallback, useEffect, useState } from "react";
import { getModule, trackModules } from "../data/curriculum.js";

const KEY = "rootbridge_learning_progress";
const EVENT = "rootbridge-progress-changed";

export const defaultProgress = {
  name: "Explorer",
  romanization: true, // show latin spelling under Nepali words
  reducedMotion: false,
  xp: 0,
  completedLessons: [], // lesson ids
  masteredModules: [], // module ids (only set by finishing a module quest)
  rhythmDays: [], // "YYYY-MM-DD" days the learner practised
};

export function readProgress() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...defaultProgress, ...JSON.parse(raw) } : { ...defaultProgress };
  } catch {
    return { ...defaultProgress };
  }
}

function save(next) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage can be blocked (private mode). The session still works.
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useProgress() {
  // The function form runs once, on the first render.
  const [state, setState] = useState(() => readProgress());

  // Listen for changes made by other components.
  useEffect(() => {
    const sync = () => setState(readProgress());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync); // other browser tabs
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const change = useCallback((makeNext) => {
    const next = makeNext(readProgress());
    save(next);
    setState(next);
  }, []);

  const update = useCallback((patch) => change((prev) => ({ ...prev, ...patch })), [change]);

  const completeLesson = useCallback(
    (lessonId, xp) => {
      const today = new Date().toISOString().slice(0, 10);
      change((prev) => {
        const alreadyDone = prev.completedLessons.includes(lessonId);
        return {
          ...prev,
          // Repeating a lesson still gives a little XP.
          xp: prev.xp + (alreadyDone ? Math.round(xp * 0.2) : xp),
          completedLessons: alreadyDone ? prev.completedLessons : [...prev.completedLessons, lessonId],
          rhythmDays: prev.rhythmDays.includes(today) ? prev.rhythmDays : [...prev.rhythmDays, today],
        };
      });
    },
    [change],
  );

  const masterModule = useCallback(
    (moduleId, xp) => {
      change((prev) => {
        if (prev.masteredModules.includes(moduleId)) return prev;
        return { ...prev, xp: prev.xp + xp, masteredModules: [...prev.masteredModules, moduleId] };
      });
    },
    [change],
  );

  const reset = useCallback(() => {
    save({ ...defaultProgress });
    setState({ ...defaultProgress });
  }, []);

  return { state, update, completeLesson, masterModule, reset };
}

// "l1-1" -> "language", "c2-3" -> "culture"
export function trackOf(moduleId) {
  if (moduleId.startsWith("l")) return "language";
  if (moduleId.startsWith("c")) return "culture";
  return undefined;
}

// Returns "locked" | "available" | "in-progress" | "mastered"
export function moduleStatus(state, moduleId) {
  const mod = getModule(moduleId);
  if (!mod) return "locked";
  if (state.masteredModules.includes(moduleId)) return "mastered";
  if (mod.lessons.some((l) => state.completedLessons.includes(l.id))) return "in-progress";

  const track = trackOf(moduleId);
  if (!track) return "available";
  const ordered = trackModules(track);
  const index = ordered.findIndex((x) => x.id === moduleId);
  if (index <= 0) return "available"; // the very first module is always open

  // A module opens when the one before it is mastered or all its lessons are done.
  const prev = ordered[index - 1];
  const prevDone =
    state.masteredModules.includes(prev.id) ||
    prev.lessons.every((l) => state.completedLessons.includes(l.id));
  return prevDone ? "available" : "locked";
}

export function moduleProgress(state, moduleId) {
  const mod = getModule(moduleId);
  if (!mod) return { done: 0, total: 0, pct: 0 };
  const done = mod.lessons.filter((l) => state.completedLessons.includes(l.id)).length;
  return { done, total: mod.lessons.length, pct: (done / mod.lessons.length) * 100 };
}

export function trackProgress(state, trackId) {
  const mods = trackModules(trackId);
  const lessons = mods.flatMap((m) => m.lessons);
  const doneLessons = lessons.filter((l) => state.completedLessons.includes(l.id)).length;
  return {
    modules: mods.length,
    mastered: mods.filter((m) => state.masteredModules.includes(m.id)).length,
    lessons: lessons.length,
    doneLessons,
    pct: lessons.length ? (doneLessons / lessons.length) * 100 : 0,
  };
}

export function levelFromXp(xp) {
  let level = 1;
  while (Math.round(100 * Math.pow(level + 1, 1.35)) <= xp) level += 1;
  return level;
}
