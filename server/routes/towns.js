const express = require("express");
const requireUser = require("../middleware/requireUser");

const Town = require("../models/Town");

const router = express.Router();

// GET /api/towns
router.get("/", requireUser, async (req, res) => {
  try {
    const towns = await Town.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    res.json({ towns });
  } catch (e) {
    console.log("GET /api/towns error:", e);
    res.status(500).json({ error: e?.message || String(e) });
  }
});

// POST /api/towns
router.post("/", requireUser, async (req, res) => {
  try {
    const name = String(req.body?.name || "My First Town");
    const gridSize = Number(req.body?.gridSize || 2);

    const town = await Town.create({
      ownerId: req.user._id,
      name,
      gridSize,
      thumbnailUrl: "",
    });

    res.json({ town });
  } catch (e) {
    console.log("POST /api/towns error:", e);
    res.status(500).json({ error: e?.message || String(e) });
  }
});

module.exports = router;
