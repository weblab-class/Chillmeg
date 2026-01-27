const express = require("express");
const requireUser = require("../middleware/requireUser");
const TownModel = require("../models/Town");

const router = express.Router();

router.get("/", requireUser, async (req, res) => {
  const towns = await TownModel.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
  res.json({
    towns: towns.map((t) => ({
      _id: t._id,
      name: t.name,
      gridSize: t.gridSize,
      thumbnailUrl: t.thumbnailUrl || "",
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    })),
  });
});

router.post("/", requireUser, async (req, res) => {
  const name = String(req.body?.name || "").trim() || "Untitled Town";

  const town = await TownModel.create({
    ownerId: req.user._id,
    name,
    gridSize: 2,
    thumbnailUrl: "",
  });

  res.json({
    town: {
      _id: town._id,
      name: town.name,
      gridSize: town.gridSize,
      thumbnailUrl: town.thumbnailUrl || "",
      createdAt: town.createdAt,
      updatedAt: town.updatedAt,
    },
  });
});

module.exports = router;
