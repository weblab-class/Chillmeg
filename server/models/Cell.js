const mongoose = require("mongoose");

const CellSchema = new mongoose.Schema(
  {
    mapId: { type: mongoose.Schema.Types.ObjectId, ref: "Map", required: true },
    gridMode: { type: Number, required: true },
    cellIndex: { type: Number, required: true },
    status: { type: String, enum: ["empty", "reserved", "filled"], default: "empty" },
    reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reservedUntil: { type: Date, default: null },
    splatId: { type: mongoose.Schema.Types.ObjectId, ref: "Splat", default: null },
    townID: { type: mongoose.Schema.Types.ObjectId, ref: "Town", index: true },
  },
  { timestamps: true }
);

CellSchema.index({ mapId: 1, gridMode: 1, cellIndex: 1 }, { unique: true });

module.exports = mongoose.model("Cell", CellSchema);
