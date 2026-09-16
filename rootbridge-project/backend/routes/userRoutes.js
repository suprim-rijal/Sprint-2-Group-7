// User routes. Mounted at /api/users.
const express = require("express");
const { getUsers, updateUser } = require("../controllers/userController");

const router = express.Router();

router.get("/", getUsers);
router.post("/update", updateUser);

module.exports = router;
