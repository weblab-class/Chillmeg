const express = require("express");
const requireUser = require("../middleware/requireUser");
const CellModel = require("../models/Cell");
const SplatModel = require("../models/Splat");

const router = express.Router();

router.delete("/:splatId", requireUser, async (req, res) => {
  try {
    const { splatId } = req.params;

    const splat = await SplatModel.findById(splatId);
    if (!splat) return res.status(404).json({ error: "Splat not found" });

    if (String(splat.ownerId) !== String(req.user._id)) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await CellModel.updateOne(
      { _id: splat.cellId },
      {
        $set: {
          status: "empty",
          splatId: null,
          reservedBy: null,
          reservedUntil: null,
        },
      }
    );

    await SplatModel.deleteOne({ _id: splatId });

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message || "Delete failed" });
  }
});

module.exports = router;
