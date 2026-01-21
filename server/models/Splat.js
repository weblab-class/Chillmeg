const mongoose = require("mongoose");

const SplatSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mapId: { type: mongoose.Schema.Types.ObjectId, ref: "Map", required: true },
    cellId: { type: mongoose.Schema.Types.ObjectId, ref: "Cell", required: true },
    status: { type: String, enum: ["queued", "ready", "failed"], default: "queued" },

    lumaCaptureUrl: { type: String, default: "" },

    assetUrl: { type: String, required: true },
    placeholderUrl: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Splat", SplatSchema);
