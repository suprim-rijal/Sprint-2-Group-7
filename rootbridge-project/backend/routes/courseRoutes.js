// Course routes. Mounted at /api in server.js, so "/tracks" becomes "/api/tracks".
const express = require("express");
const { getTracks, getTrackById, getModuleById, getLessonById } = require("../controllers/courseController");

const router = express.Router();

router.get("/tracks", getTracks);
router.get("/tracks/:trackId", getTrackById);
router.get("/modules/:moduleId", getModuleById);
router.get("/lessons/:lessonId", getLessonById);

module.exports = router;
