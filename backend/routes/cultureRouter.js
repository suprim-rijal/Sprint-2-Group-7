const express = require("express");
const router = express.Router();
const {
  getAllCultures,
  getCultureById,
  createCultureCategory,
  updateCulture,
  deleteCulture,
} = require("../controllers/cultureControllers");

router.get("/", getAllCultures);
router.post("/", createCultureCategory);
router.get("/:id", getCultureById);
router.put("/:id", updateCulture);
router.delete("/:id", deleteCulture);

module.exports = router;