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
    const safe = `${Date.now()}_${Math.random().toString(16).slice(2)}_${file.originalname}`;
    cb(null, safe);
  },
});

const uploadPly = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const name = (file.originalname || "").toLowerCase();
    const ok = name.endsWith(".ply");
    if (!ok) return cb(new Error("Only .ply files are allowed"));
    cb(null, true);
  },
});

router.post("/ply", requireUser, uploadPly.single("asset"), async (req, res) => {
  try {
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

    const assetUrl = `/uploads/${req.file.filename}`;
    const placeholderUrl = `/placeholder.png`;

    const splat = await SplatModel.create({
      ownerId: req.user._id,
      mapId,
      cellId,
      status: "queued",
      assetUrl,
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
    }, 800);

    res.json({ splatId: splat._id, assetUrl });
  } catch (e) {
    res.status(500).json({ error: e.message || "Upload failed" });
  }
});

module.exports = router;
