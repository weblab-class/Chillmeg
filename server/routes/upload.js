const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const requireUser = require("../middleware/requireUser");
const CellModel = require("../models/Cell");
const SplatModel = require("../models/Splat");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = `${Date.now()}-${Math.random().toString(16).slice(2)}-${file.originalname}`;
    cb(null, safe);
  },
});

const upload = multer({ storage });

router.post("/video", requireUser, upload.single("video"), async (req, res) => {
  const { mapId, cellId } = req.body;

  if (!req.file) return res.status(400).json({ error: "No file" });

  const cell = await CellModel.findById(cellId);
  if (!cell) return res.status(404).json({ error: "Cell not found" });

  const isOwner = String(cell.reservedBy) === String(req.user._id);
  if (!isOwner) return res.status(403).json({ error: "Not your reserved cell" });

  const now = new Date();
  if (cell.reservedUntil && now > new Date(cell.reservedUntil)) {
    return res.status(409).json({ error: "Reservation expired" });
  }

  const videoUrl = `/uploads/${req.file.filename}`;
  const placeholderUrl = `/placeholder.png`;

  const splat = await SplatModel.create({
    ownerId: req.user._id,
    mapId,
    cellId,
    status: "queued",
    videoUrl,
    placeholderUrl,
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

  setTimeout(async () => {
    await SplatModel.updateOne({ _id: splat._id }, { $set: { status: "ready" } });
  }, 2000);

  res.json({ splatId: splat._id });
});

module.exports = router;
