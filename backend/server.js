const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DB_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Ensure db.json exists with default structures
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

if (!fs.existsSync(DB_FILE)) {
  const initialData = {
    users: [],
    messages: [],
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

// Database helper functions
function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading DB:", err);
    return { users: [], messages: [] };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing DB:", err);
  }
}

// Routes
// 1. Auth Signup
app.post("/api/auth/signup", (req, res) => {
  const { email, password, name, role, details } = req.body;
  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const db = readDB();
  const existingUser = db.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );

  if (existingUser) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const newUser = {
    id: "_" + Math.random().toString(36).substr(2, 9),
    email,
    password, // Stored in plain text for prototype demo purposes
    name,
    role, // 'parent' or 'teacher'
    details: details || {}, // parent controls, child details, teacher specs
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDB(db);

  // Return user without password
  const { password: _, ...userSafe } = newUser;
  res
    .status(201)
    .json({ message: "User registered successfully", user: userSafe });
});

// 2. Auth Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  const db = readDB();
  const user = db.users.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() && u.password === password,
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const { password: _, ...userSafe } = user;
  res.json({ message: "Login successful", user: userSafe });
});

// 3. Update User State (e.g. child dashboard values, streak, XP, parent policies)
app.post("/api/users/update", (req, res) => {
  const { userId, details } = req.body;
  if (!userId || !details) {
    return res.status(400).json({ error: "Missing userId or update details" });
  }

  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  db.users[userIndex].details = {
    ...db.users[userIndex].details,
    ...details,
  };

  writeDB(db);

  const { password: _, ...userSafe } = db.users[userIndex];
  res.json({ message: "User details updated", user: userSafe });
});

// 4. Contact Page Message Submissions
app.post("/api/contact", (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing name, email, or message" });
  }

  const db = readDB();
  const newMessage = {
    id: "_" + Math.random().toString(36).substr(2, 9),
    name,
    email,
    subject: subject || "General Query",
    message,
    createdAt: new Date().toISOString(),
  };

  db.messages.push(newMessage);
  writeDB(db);

  res
    .status(201)
    .json({ message: "Message stored successfully", contact: newMessage });
});

// 5. Get Contact Messages (for verifying or admin dashboard)
app.get("/api/contact/messages", (req, res) => {
  const db = readDB();
  res.json({ messages: db.messages });
});

// Health check / welcome
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
