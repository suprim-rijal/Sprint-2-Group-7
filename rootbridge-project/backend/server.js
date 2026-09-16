// =====================================================================
// RootBridge backend (Sprint 2): Express + MVC, mock data in data/db.json
// Start with:  npm run dev   ->  http://localhost:5000
// Test the endpoints with Postman (see README.md).
// =====================================================================
const express = require("express");
const cors = require("cors");

const logger = require("./middleware/logger");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const courseRoutes = require("./routes/courseRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Middleware: runs before every route ----
app.use(cors()); // allow the Vite frontend (port 5173) to call this API later
app.use(express.json()); // read JSON request bodies into req.body
app.use(logger); // print each request in the terminal

// ---- Routes ----
app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "ok", time: new Date().toISOString() });
});
app.use("/api", courseRoutes); // /api/tracks, /api/tracks/:id, /api/modules/:id, /api/lessons/:id
app.use("/api/auth", authRoutes); // /api/auth/login, /api/auth/signup
app.use("/api/users", userRoutes); // /api/users, /api/users/update
app.use("/api/contact", contactRoutes); // /api/contact, /api/contact/messages

// ---- Errors: must come after the routes ----
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`RootBridge backend running on http://localhost:${PORT}`);
});
