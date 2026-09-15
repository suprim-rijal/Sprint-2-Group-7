// =====================================================================
// mockApi.js  (Sprint 2: frontend works WITHOUT the backend)
// =====================================================================
// Every function here pretends to be a call to the Express backend.
// It waits a short moment (like a real network), then returns JSON that
// matches the agreed API contract (see README.md -> "API contract").
//
// In Sprint 3, when frontend and backend are connected, each function can
// be swapped for a real fetch() call to http://localhost:5000 without
// changing any page, because the returned shapes are identical.
//
// "Database" for the mock = the browser's localStorage.
// =====================================================================

import { tracks, getLesson as findLesson, getTrack, trackModules } from "../data/curriculum.js";
import { readProgress } from "../lib/progress.js";

const USERS_KEY = "rootbridge_mock_users";
const MESSAGES_KEY = "rootbridge_mock_messages";
const FAKE_DELAY_MS = 300;

// Theme colours per track (Elearn palette: indigo for language, terracotta for culture)
const TRACK_COLORS = { language: "#332B5C", culture: "#C15B3C" };

// ---------- small helpers ----------

// Wait, then give back the value. Makes the mock feel like a real request.
function respond(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), FAKE_DELAY_MS));
}

// Wait, then fail with an error message (like a 400 / 404 response).
function fail(message, status = 400) {
  return new Promise((_, reject) =>
    setTimeout(() => {
      const error = new Error(message);
      error.status = status;
      reject(error);
    }, FAKE_DELAY_MS),
  );
}

function readList(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function withoutPassword(user) {
  const { password, ...safe } = user;
  return safe;
}

// ---------- 1. Learning tracks ----------
// Contract: GET /api/tracks
export function getTracks() {
  const progress = readProgress();
  const data = tracks.map((track) => {
    const lessons = trackModules(track.id).flatMap((m) => m.lessons);
    return {
      id: `nepali-${track.id}`, // "nepali-language" | "nepali-culture"
      title: track.title,
      nepaliTitle: track.nepaliTitle,
      description: track.tagline,
      totalLessons: lessons.length,
      completedLessons: lessons.filter((l) => progress.completedLessons.includes(l.id)).length,
      themeColor: TRACK_COLORS[track.id],
    };
  });
  return respond({ success: true, data });
}

// Contract: GET /api/tracks/:trackId  (chapters + module ids)
export function getTrackById(trackId) {
  const track = getTrack(trackId);
  if (!track) return fail("Track not found", 404);
  return respond({
    success: true,
    data: {
      id: `nepali-${track.id}`,
      title: track.title,
      description: track.tagline,
      chapters: track.chapters.map((c) => ({
        id: c.id,
        code: c.code,
        title: c.title,
        moduleIds: c.modules.map((m) => m.id),
      })),
    },
  });
}

// ---------- 2. One lesson ----------
// Contract: GET /api/lessons/:lessonId
// Turns a lesson's vocabulary into simple multiple-choice prompts.
export function buildLessonPayload(mod, lesson) {
  const words = mod.items.slice(0, 4);
  const prompts = words.map((word, i) => {
    // Wrong answers: 2 other meanings from the same module.
    const others = mod.items.filter((x) => x.np !== word.np && x.en !== word.en);
    const wrong = [...others.slice(i), ...others.slice(0, i)].slice(0, 2).map((x) => x.en);
    const options = [...new Set([word.en, ...wrong])];
    // rotate so the correct answer is not always first
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

export function getLesson(lessonId) {
  const found = findLesson(lessonId);
  if (!found) return fail("Lesson not found", 404);
  return respond({ success: true, data: buildLessonPayload(found.module, found.lesson) });
}

// ---------- 3. Authentication (mock) ----------
// Contract: POST /api/auth/login  body { email, password }
// Any password is accepted in Sprint 2.
export function login({ email, password }) {
  if (!email || !password) return fail("Please enter your email and password.");
  const registered = readList(USERS_KEY).find((u) => u.email.toLowerCase() === email.toLowerCase());
  const user = registered
    ? withoutPassword(registered)
    : { id: "usr-guest", name: "Elearn Explorer", email, role: "student", details: {} };
  return respond({ success: true, message: "Mock login successful", user });
}

// POST /api/auth/signup  body { name, email, password, role }
export function signup({ name, email, password, role }) {
  if (!name || !email || !password || !role) return fail("Please fill in every field.");
  const users = readList(USERS_KEY);
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return fail("This email is already registered. Log in instead.");
  }
  const newUser = {
    id: makeId("usr"),
    name,
    email,
    password, // mock only: never store plain passwords in a real app
    role,
    details: {},
    createdAt: new Date().toISOString(),
  };
  writeList(USERS_KEY, [...users, newUser]);
  return respond({ success: true, message: "User registered successfully", user: withoutPassword(newUser) });
}

// POST /api/users/update  body { userId, details }
export function updateUser({ userId, details }) {
  const users = readList(USERS_KEY);
  const index = users.findIndex((u) => u.id === userId);
  const session = JSON.parse(localStorage.getItem("rootbridge_user") || "null");

  let updated;
  if (index >= 0) {
    users[index] = { ...users[index], details: { ...users[index].details, ...details } };
    writeList(USERS_KEY, users);
    updated = withoutPassword(users[index]);
  } else if (session && session.id === userId) {
    // The default demo user is not in the list, so update the session copy.
    updated = { ...session, details: { ...session.details, ...details } };
  } else {
    return fail("User not found", 404);
  }
  return respond({ success: true, message: "User details updated", user: updated });
}

// ---------- 4. Contact messages ----------
// POST /api/contact  body { name, email, subject, message }
export function sendContactMessage({ name, email, subject, message }) {
  if (!name || !email || !message) return fail("Please add your name, email and message.");
  const contact = {
    id: makeId("msg"),
    name,
    email,
    subject: subject || "General Query",
    message,
    createdAt: new Date().toISOString(),
  };
  writeList(MESSAGES_KEY, [...readList(MESSAGES_KEY), contact]);
  return respond({ success: true, message: "Message stored successfully", contact });
}

// GET /api/contact/messages
export function getContactMessages() {
  return respond({ success: true, messages: readList(MESSAGES_KEY) });
}
