// User controller: list users and update a user's name and saved details
// (onboarding answers, interface mode, classes, parent settings, photo).
const { readDB, writeDB, withoutPassword } = require("../utils/db");

// GET /api/users
function getUsers(req, res) {
  res.json({ success: true, data: readDB().users.map(withoutPassword) });
}

// POST /api/users/update   body: { userId, name?, details? }
// Each key in "details" replaces the old key (send whole nested objects,
// e.g. the full "onboarding" object), same as the frontend mock.
function updateUser(req, res) {
  const { userId, name, details = {} } = req.body || {};
  if (!userId || typeof details !== "object" || Array.isArray(details)) {
    return res.status(400).json({ success: false, error: "Send a userId and a details object." });
  }
  if (name !== undefined && !String(name).trim()) {
    return res.status(400).json({ success: false, error: "Your name cannot be empty." });
  }

  const db = readDB();
  const index = db.users.findIndex((u) => u.id === userId);
  if (index === -1) return res.status(404).json({ success: false, error: "User not found" });

  if (name !== undefined) db.users[index].name = String(name).trim();
  db.users[index].details = { ...db.users[index].details, ...details };
  writeDB(db);

  res.json({ success: true, message: "User details updated", user: withoutPassword(db.users[index]) });
}

module.exports = { getUsers, updateUser };
