// Course controller: tracks, modules and lessons.
// A "controller" holds the logic. The routes file only says which URL calls which function.
const { readDB } = require("../utils/db");

// Turn a module's words into multiple-choice prompts.
// Same logic as frontend/src/services/mockApi.js, so both return the same JSON.
function buildLessonPayload(mod, lesson) {
  const words = mod.items.slice(0, 4);
  const prompts = words.map((word, i) => {
    const others = mod.items.filter((x) => x.np !== word.np && x.en !== word.en);
    const wrong = [...others.slice(i), ...others.slice(0, i)].slice(0, 2).map((x) => x.en);
    const options = [...new Set([word.en, ...wrong])];
    const shift = i % options.length;
    const rotated = [...options.slice(shift), ...options.slice(0, shift)];
    return {
      question: `What does ${word.np} (${word.rom}) mean?`,
      options: rotated,
      correctAnswer: rotated.indexOf(word.en),
    };
  });

  const first = mod.items[0];
  return {
    id: lesson.id,
    moduleId: mod.id,
    title: lesson.title,
    phase: lesson.phase,
    minutes: lesson.minutes,
    storyText: `${mod.title}: ${mod.goal}${first ? ` Today's first word is ${first.np} (${first.rom}), which means "${first.en}".` : ""}`,
    prompts,
  };
}

// Accept "nepali-language" or just "language".
function normaliseTrackId(id) {
  return id.startsWith("nepali-") ? id : `nepali-${id}`;
}

// GET /api/tracks
function getTracks(req, res) {
  const { tracks } = readDB();
  const data = tracks.map(({ chapterIds, ...summary }) => summary);
  res.json({ success: true, data });
}

// GET /api/tracks/:trackId
function getTrackById(req, res) {
  const db = readDB();
  const track = db.tracks.find((t) => t.id === normaliseTrackId(req.params.trackId));
  if (!track) return res.status(404).json({ success: false, error: "Track not found" });

  const chapters = db.chapters
    .filter((c) => c.trackId === track.id)
    .map((c) => ({ id: c.id, code: c.code, title: c.title, moduleIds: c.moduleIds }));

  res.json({
    success: true,
    data: { id: track.id, title: track.title, description: track.description, chapters },
  });
}

// GET /api/modules/:moduleId
function getModuleById(req, res) {
  const mod = readDB().modules.find((m) => m.id === req.params.moduleId);
  if (!mod) return res.status(404).json({ success: false, error: "Module not found" });
  res.json({ success: true, data: mod });
}

// GET /api/lessons/:lessonId
function getLessonById(req, res) {
  const { lessonId } = req.params;
  // Lessons live inside modules, so search every module.
  for (const mod of readDB().modules) {
    const lesson = mod.lessons.find((l) => l.id === lessonId);
    if (lesson) return res.json({ success: true, data: buildLessonPayload(mod, lesson) });
  }
  res.status(404).json({ success: false, error: "Lesson not found" });
}

module.exports = { getTracks, getTrackById, getModuleById, getLessonById };
