// Tiny "database" helper: the whole database is one JSON file (data/db.json).
// readDB() loads it into a JS object, writeDB() saves the object back.
const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "..", "data", "db.json");
const EMPTY_DB = { tracks: [], chapters: [], modules: [], users: [], messages: [] };

function readDB() {
  try {
    return { ...EMPTY_DB, ...JSON.parse(fs.readFileSync(DB_FILE, "utf8")) };
  } catch (err) {
    console.error("Could not read db.json:", err.message);
    return { ...EMPTY_DB };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

// Never send passwords back to the client.
function withoutPassword(user) {
  const { password, ...safe } = user;
  return safe;
}

module.exports = { readDB, writeDB, makeId, withoutPassword };
