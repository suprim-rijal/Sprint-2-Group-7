// Auth controller (MOCK for Sprint 2).
// - Login: the email must exist and the chosen role must match the
//   account. The password is NOT checked yet.
// - Signup: any of the four roles; Child/Parent also needs childName.
// - Forgot password: always the same answer (does not reveal accounts).
// Sprint 3: hash passwords (bcrypt), return a token (JWT), email reset links.
const { readDB, writeDB, makeId, withoutPassword } = require("../utils/db");
const { ROLES, ROLE_LABELS, isKnownRole } = require("../config/roles");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Starting details for every new account (same shape as the frontend mock).
function newUserDetails(childName = "") {
  return {
    avatar: null,
    parentAvatar: null,
    onboarding: { language: "nepali", completed: false },
    classes: [],
    parentSettings: {
      childName,
      dailyMinutes: 20,
      weeklyGoalDays: 4,
      allowedTracks: { language: true, culture: true },
      allowSpeaking: true,
      requirePin: false,
      pin: "",
    },
  };
}

function findByEmail(db, email) {
  return db.users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
}

// POST /api/auth/login   body: { email, password, role }
function login(req, res) {
  const { email, password, role } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Enter your email and password." });
  }
  if (!isKnownRole(role)) {
    return res.status(400).json({ success: false, error: "Choose your role." });
  }

  const found = findByEmail(readDB(), email);
  if (!found) {
    return res.status(401).json({ success: false, error: "No account uses this email. Create an account first." });
  }
  if (found.role !== role) {
    return res.status(403).json({
      success: false,
      error: `This account is registered as "${ROLE_LABELS[found.role]}". Choose that role and try again.`,
    });
  }

  res.json({ success: true, message: "Mock login successful", user: withoutPassword(found) });
}

// POST /api/auth/signup   body: { name, childName?, email, password, role }
function signup(req, res) {
  const { name, childName, email, password, role } = req.body || {};
  if (!isKnownRole(role)) {
    return res.status(400).json({ success: false, error: "Choose your role." });
  }
  const isFamily = role === ROLES.CHILD_PARENT;
  if (!name?.trim() || !email || !password || (isFamily && !childName?.trim())) {
    return res.status(400).json({ success: false, error: "Fill in every field." });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ success: false, error: "Enter a valid email address." });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ success: false, error: "Use a password with at least 6 characters." });
  }

  const db = readDB();
  if (findByEmail(db, email)) {
    return res.status(400).json({ success: false, error: "This email already has an account. Log in instead." });
  }

  const newUser = {
    id: makeId("usr"),
    name: name.trim(),
    email: email.trim(),
    password, // mock only: a real app must hash passwords
    role,
    details: newUserDetails(isFamily ? childName.trim() : ""),
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);
  writeDB(db);

  res.status(201).json({ success: true, message: "User registered successfully", user: withoutPassword(newUser) });
}

// POST /api/auth/forgot-password   body: { email }
function forgotPassword(req, res) {
  const { email } = req.body || {};
  if (!EMAIL_PATTERN.test(email || "")) {
    return res.status(400).json({ success: false, error: "Enter a valid email address." });
  }
  // Sprint 3: if the account exists, create a one-time token and email a link.
  res.json({ success: true, message: "If an account uses this email, a reset link is on its way." });
}

module.exports = { login, signup, forgotPassword };
