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
//
// State management overview (for the team):
//   - mockApi.js            fake server: users, classes, contact messages
//   - context/AuthContext   who is logged in + onboarding + preferences
//   - lib/progress.js       lessons done / XP, saved per user
// =====================================================================

import { tracks, getLesson as findLesson, getTrack, trackModules } from "../data/curriculum.js";
import { readProgress } from "../lib/progress.js";
import { ROLE_LABELS, ROLES, isKnownRole } from "../config/roles.js";

const USERS_KEY = "rootbridge_mock_users_v4";
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
  const { password: _password, ...safe } = user;
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

// ---------- 3. Users ----------
// Everything about a user that is not name/email/role lives in "details".
// The backend's POST /api/users/update replaces keys inside "details",
// so this shape works for both the mock and the real server.
export const DEFAULT_DETAILS = {
  avatar: null, // learner photo (Cultural Passport / Normal profile), data URL
  parentAvatar: null, // parent photo (Parent profile), data URL
  onboarding: {
    language: "nepali", // learning language (only Nepali is active)
    completed: false, // true after the welcome animation
  },
  classes: [], // classes joined with a 6-digit teacher code
  parentSettings: {
    childName: "",
    dailyMinutes: 20,
    weeklyGoalDays: 4,
    allowedTracks: { language: true, culture: true },
    allowSpeaking: true,
    requirePin: false, // off = "Switch to Parent View" is instant
    pin: "", // mock only: a real app must never store a PIN in plain text
  },
};

// Accounts saved by earlier drafts used other role names.
const LEGACY_ROLES = { parent: ROLES.CHILD_PARENT, student: ROLES.CHILD_PARENT };

// Fill in any missing fields, so older saved users never crash a page.
export function normalizeUser(user) {
  if (!user) return null;
  const d = user.details || {};
  const role = isKnownRole(user.role) ? user.role : LEGACY_ROLES[user.role] ?? ROLES.NORMAL;
  return {
    ...user,
    role,
    details: {
      ...DEFAULT_DETAILS,
      ...d,
      onboarding: { ...DEFAULT_DETAILS.onboarding, ...d.onboarding },
      classes: Array.isArray(d.classes) ? d.classes : [],
      parentSettings: {
        ...DEFAULT_DETAILS.parentSettings,
        ...d.parentSettings,
        allowedTracks: {
          ...DEFAULT_DETAILS.parentSettings.allowedTracks,
          ...d.parentSettings?.allowedTracks,
        },
      },
    },
  };
}

// Demo accounts, one per role, already past the welcome screen.
const WELCOMED = { onboarding: { language: "nepali", completed: true } };
const SEED_USERS = [
  {
    id: "usr-201",
    name: "Sita Sharma",
    email: "family@demo.com",
    password: "demo123",
    role: ROLES.CHILD_PARENT,
    details: { ...WELCOMED, parentSettings: { childName: "Aarav" } },
    createdAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "usr-202",
    name: "Priya Thapa",
    email: "learner@demo.com",
    password: "demo123",
    role: ROLES.NORMAL,
    details: { ...WELCOMED },
    createdAt: "2026-09-01T10:05:00.000Z",
  },
  {
    id: "usr-301",
    name: "Hari Gurung",
    email: "teacher@demo.com",
    password: "demo123",
    role: ROLES.TEACHER,
    details: { ...WELCOMED },
    createdAt: "2026-09-01T10:10:00.000Z",
  },
  {
    id: "usr-401",
    name: "Asha Karki",
    email: "admin@demo.com",
    password: "demo123",
    role: ROLES.ADMIN,
    details: { ...WELCOMED },
    createdAt: "2026-09-01T10:15:00.000Z",
  },
];

function readUsers() {
  const stored = localStorage.getItem(USERS_KEY);
  if (stored === null) {
    writeList(USERS_KEY, SEED_USERS); // first visit: add the demo accounts
    return [...SEED_USERS];
  }
  return readList(USERS_KEY);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function findByEmail(email) {
  return readUsers().find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
}

// ---------- 4. Authentication (mock) ----------
// Future endpoint: POST /api/auth/login   body { email, password, role }
// Sprint 2: the email must exist and the chosen role must match the
// account. The password is NOT checked yet.
// Sprint 3: the backend compares a hashed password and returns a token.
export function login({ email, password, role }) {
  if (!email || !password) return fail("Enter your email and password.");
  if (!isKnownRole(role)) return fail("Choose your role.");
  const found = findByEmail(email);
  if (!found) return fail("No account uses this email. Create an account first.", 401);
  const user = normalizeUser(withoutPassword(found));
  if (user.role !== role) {
    return fail(
      `This account is registered as "${ROLE_LABELS[user.role]}". Choose that role and try again.`,
      403,
    );
  }
  return respond({ success: true, message: "Mock login successful", user });
}

// Future endpoint: POST /api/auth/signup
// body { name, childName?, email, password, role }
// childName is required only for Child/Parent accounts.
export function signup({ name, childName, email, password, role }) {
  if (!isKnownRole(role)) return fail("Choose your role.");
  const isFamily = role === ROLES.CHILD_PARENT;
  if (!name?.trim() || !email || !password || (isFamily && !childName?.trim())) {
    return fail("Fill in every field.");
  }
  if (!EMAIL_PATTERN.test(email)) return fail("Enter a valid email address.");
  if (password.length < 6) return fail("Use a password with at least 6 characters.");
  if (findByEmail(email)) return fail("This email already has an account. Log in instead.");

  const details = structuredClone(DEFAULT_DETAILS);
  if (isFamily) details.parentSettings.childName = childName.trim();
  const newUser = {
    id: makeId("usr"),
    name: name.trim(),
    email: email.trim(),
    password, // mock only: never store plain passwords in a real app
    role,
    details,
    createdAt: new Date().toISOString(),
  };
  writeList(USERS_KEY, [...readUsers(), newUser]);
  return respond({
    success: true,
    message: "User registered successfully",
    user: normalizeUser(withoutPassword(newUser)),
  });
}

// Future endpoint: POST /api/auth/forgot-password   body { email }
// Always answers the same way, whether or not the email exists, so the
// page cannot be used to find out who has an account.
// Sprint 3: the backend emails a one-time reset link.
export function requestPasswordReset({ email }) {
  if (!EMAIL_PATTERN.test(email || "")) return fail("Enter a valid email address.");
  return respond({
    success: true,
    message: "If an account uses this email, a reset link is on its way.",
  });
}

// Future endpoint: POST /api/users/update   body { userId, name?, details }
// "details" keys replace the old keys (send whole nested objects).
export function updateUser({ userId, name, details = {} }) {
  const users = readUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index < 0) return fail("User not found", 404);
  if (name !== undefined && !name.trim()) return fail("The name cannot be empty.");

  users[index] = {
    ...users[index],
    ...(name !== undefined ? { name: name.trim() } : {}),
    details: { ...users[index].details, ...details },
  };
  try {
    writeList(USERS_KEY, users);
  } catch {
    // localStorage is full (usually a very large profile image)
    return fail("This could not be saved. Try a smaller image.", 413);
  }
  return respond({
    success: true,
    message: "User details updated",
    user: normalizeUser(withoutPassword(users[index])),
  });
}

// ---------- 5. Classes (UI only in Sprint 2) ----------
// Teachers will create classes in a future sprint. For now these
// 6-digit codes work:
const MOCK_CLASSES = [
  { code: "482913", name: "Nepali Starters", teacher: "Ms. Sharma", meets: "Saturdays, 10:00" },
  { code: "305726", name: "Devanagari Explorers", teacher: "Mr. Gurung", meets: "Wednesdays, 17:00" },
  { code: "771040", name: "Festivals of Nepal", teacher: "Ms. Tamang", meets: "Sundays, 11:00" },
];
export const DEMO_CLASS_CODES = MOCK_CLASSES.map((c) => c.code);
export const CLASS_CODE_LENGTH = 6;
export const CLASS_CODE_PATTERN = /^\d{6}$/;

// Keeps digits only, at most 6: " 48-29 13" -> "482913"
export function cleanClassCode(raw) {
  return raw.replace(/\D/g, "").slice(0, CLASS_CODE_LENGTH);
}

// Future endpoint: POST /api/classes/join   body { userId, code }
// Returns the updated user, like the other user calls.
export async function joinClass({ userId, code }) {
  const clean = cleanClassCode(code);
  if (!CLASS_CODE_PATTERN.test(clean)) return fail("A class code has 6 numbers.");
  const found = MOCK_CLASSES.find((c) => c.code === clean);
  if (!found) return fail("We could not find that class. Check the code with your teacher.", 404);

  const user = readUsers().find((u) => u.id === userId);
  if (!user) return fail("User not found", 404);
  const classes = normalizeUser(user).details.classes;
  if (classes.some((c) => c.code === clean)) return fail("You are already in this class.", 409);

  return updateUser({
    userId,
    details: { classes: [...classes, { ...found, joinedAt: new Date().toISOString() }] },
  });
}

// Future endpoint: POST /api/classes/leave   body { userId, code }
export function leaveClass({ userId, code }) {
  const user = readUsers().find((u) => u.id === userId);
  if (!user) return fail("User not found", 404);
  const classes = normalizeUser(user).details.classes.filter((c) => c.code !== code);
  return updateUser({ userId, details: { classes } });
}

// ---------- 6. Contact messages ----------
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
