// Contact routes. Mounted at /api/contact.
const express = require("express");
const { createMessage, getMessages } = require("../controllers/contactController");

const router = express.Router();

router.post("/", createMessage);
router.get("/messages", getMessages);

module.exports = router;
