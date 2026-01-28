const express = require("express");
const router = express.Router();
const requireUser = require("../middleware/requireUser");
const Splat = require("../models/Splat");

function cellKey(x, y) {
  return `${x},${y}`;
}

router.get("/", async (req, res) => {
  const splats = await Splat.find({}).lean();
  res.json({ splats });
});

router.post("/", requireUser, async (req, res) => {
  const { name, lumaUrl, dimensions, cells } = req.body;

  if (!name || !lumaUrl || !cells || cells.length === 0) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const normalized = [];
  const seen = new Set();

  for (const c of cells) {
    const x = Math.floor(Number(c.x));
    const y = Math.floor(Number(c.y));
    const key = cellKey(x, y);
    if (!seen.has(key)) {
      seen.add(key);
      normalized.push({ x, y });
    }
  }

  const existing = await Splat.find({}, { cells: 1 }).lean();
  const occupied = new Set();

  for (const s of existing) {
    for (const c of s.cells) {
      occupied.add(cellKey(c.x, c.y));
    }
  }

  for (const c of normalized) {
    if (occupied.has(cellKey(c.x, c.y))) {
      return res.status(409).json({ error: "Cell already occupied" });
    }
  }

  const splat = await Splat.create({
    ownerId: req.user._id,
    ownerName: req.user.name || req.user.email || "Unknown",
    name,
    lumaUrl,
    dimensions,
    cells: normalized,
  });

  res.json({ splat });
});

router.delete("/:id", requireUser, async (req, res) => {
  const splat = await Splat.findById(req.params.id);
  if (!splat) return res.status(404).json({ error: "Not found" });

  if (String(splat.ownerId) !== String(req.user._id)) {
    return res.status(403).json({ error: "Not allowed" });
  }

  await splat.deleteOne();
  res.json({ ok: true });
});

module.exports = router;
