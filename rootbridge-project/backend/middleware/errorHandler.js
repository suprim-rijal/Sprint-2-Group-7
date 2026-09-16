// 404 for any /api route that does not exist.
function notFound(req, res) {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Catches errors thrown inside controllers, and bad JSON bodies.
// Express knows this is an error handler because it has 4 parameters.
function errorHandler(err, req, res, next) {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, error: "Request body is not valid JSON" });
  }
  console.error(err);
  res.status(500).json({ success: false, error: "Something went wrong on the server" });
}

module.exports = { notFound, errorHandler };
