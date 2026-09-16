// Contact controller: messages sent from the Contact page.
const { readDB, writeDB, makeId } = require("../utils/db");

// POST /api/contact   body: { name, email, subject, message }
function createMessage(req, res) {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Please add your name, email and message." });
  }

  const db = readDB();
  const contact = {
    id: makeId("msg"),
    name,
    email,
    subject: subject || "General Query",
    message,
    createdAt: new Date().toISOString(),
  };
  db.messages.push(contact);
  writeDB(db);

  res.status(201).json({ success: true, message: "Message stored successfully", contact });
}

// GET /api/contact/messages
function getMessages(req, res) {
  res.json({ success: true, messages: readDB().messages });
}

module.exports = { createMessage, getMessages };
