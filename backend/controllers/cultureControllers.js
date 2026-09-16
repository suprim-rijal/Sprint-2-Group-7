const Culture = require("../models/cultureModels");
const mongoose = require("mongoose");

// GET /api/cultures
const getAllCultures = async (req, res) => {
  try {
    const cultures = await Culture.find({}).sort({ createdAt: -1 });
    res.status(200).json(cultures);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve culture data" });
  }
};

// POST /api/cultures
const createCultureCategory = async (req, res) => {
  try {
    const newCulture = await Culture.create({ ...req.body });
    res.status(201).json(newCulture);
  } catch (error) {
    res.status(400).json({ message: "Failed to create culture category" });
  }
};

// GET /api/cultures/:id
const getCultureById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid culture ID" });
  }

  try {
    const culture = await Culture.findById(id);
    if (culture) {
      res.status(200).json(culture);
    } else {
      res.status(404).json({ message: "Culture category not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve culture category" });
  }
};

// PUT /api/cultures/:id
const updateCulture = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid culture ID" });
  }

  try {
    const updatedCulture = await Culture.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true }
    );

    if (updatedCulture) {
      res.status(200).json(updatedCulture);
    } else {
      res.status(404).json({ message: "Culture category not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update culture category" });
  }
};

// DELETE /api/cultures/:id
const deleteCulture = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid culture ID" });
  }

  try {
    const deletedCulture = await Culture.findOneAndDelete({ _id: id });

    if (deletedCulture) {
      res.status(200).json({ message: "Culture category deleted successfully." });
    } else {
      res.status(404).json({ message: "Culture category not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete culture category" });
  }
};

module.exports = {
  getAllCultures,
  getCultureById,
  createCultureCategory,
  updateCulture,
  deleteCulture,
};