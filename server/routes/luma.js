const express = require("express");
const requireUser = require("../middleware/requireUser");
const CellModel = require("../models/Cell");
const SplatModel = require("../models/Splat");

const router = express.Router();

router.post("/attach", requireUser, async (req, res) => {
  try {
    const { mapId, cellId, lumaCaptureUrl } = req.body;

    if (!mapId || !cellId || !lumaCaptureUrl) {
      return res.status(400).json({ error: "Missing mapId, cellId, or lumaCaptureUrl" });
    }

    const cell = await CellModel.findById(cellId);
    if (!cell) return res.status(404).json({ error: "Cell not found" });

    if (String(cell.reservedBy) !== String(req.user._id)) {
      return res.status(403).json({ error: "Not your reserved cell" });
    }

    const now = new Date();
    if (cell.reservedUntil && now > new Date(cell.reservedUntil)) {
      return res.status(409).json({ error: "Reservation expired" });
    }

    const splat = await SplatModel.create({
      ownerId: req.user._id,
      mapId,
      cellId,
      status: "ready",
      placeholderUrl: "/placeholder.png",
      assetUrl: "luma",
      lumaCaptureUrl: String(lumaCaptureUrl).trim(),
    });

    await CellModel.updateOne(
      { _id: cellId },
      {
        $set: {
          status: "filled",
          splatId: splat._id,
          reservedBy: null,
          reservedUntil: null,
        },
      }
    );

    res.json({ ok: true, splatId: splat._id });
  } catch (e) {
    res.status(500).json({ error: e.message || "Attach failed" });
  }
});

module.exports = router;
