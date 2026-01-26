const mongoose = require("mongoose");

const MapSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    allowedGridModes: { type: [Number], default: [9] },
    cellSizeWorld: { type: Number, default: 10 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Map", MapSchema);
