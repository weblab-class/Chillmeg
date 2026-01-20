const express = require("express");
const MapModel = require("../models/Map");
const CellModel = require("../models/Cell");
const requireUser = require("../middleware/requireUser");

const router = express.Router();

router.get("/", requireUser, async (req, res) => {
  const maps = await MapModel.find({}).sort({ createdAt: 1 });
  res.json({ maps });
});

router.get("/:mapId/cells", requireUser, async (req, res) => {
  const { mapId } = req.params;
  const gridMode = Number(req.query.gridMode || 9);

  const cells = await CellModel.find({ mapId, gridMode }).sort({ cellIndex: 1 });
  res.json({ cells });
});

router.post("/:mapId/cells/:cellIndex/reserve", requireUser, async (req, res) => {
  const { mapId, cellIndex } = req.params;
  const gridMode = Number(req.body.gridMode || 9);

  const now = new Date();
  const reservedUntil = new Date(now.getTime() + 5 * 60 * 1000);

  const updated = await CellModel.findOneAndUpdate(
    {
      mapId,
      gridMode,
      cellIndex: Number(cellIndex),
      status: "empty",
    },
    {
      $set: {
        status: "reserved",
        reservedBy: req.user._id,
        reservedUntil,
      },
    },
    { new: true }
  );

  if (!updated) {
    return res.status(409).json({ error: "Cell not available" });
  }

  res.json({ cell: updated });
});

module.exports = router;
