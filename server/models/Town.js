const mongoose = require("mongoose");

const TownSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    gridSize: { type: Number, default: 2 }, // 2 means 2x2 to start
    thumbnailUrl: { type: String, default: "" }, // optional, can fill later
  },
  { timestamps: true }
);

module.exports = mongoose.model("Town", TownSchema);
