const mongoose = require("mongoose");

const SplatSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    ownerName: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    lumaUrl: {
      type: String,
      required: true,
    },

    dimensions: {
      x: Number,
      y: Number,
      z: Number,
    },

    cells: [
      {
        x: Number,
        y: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Splat", SplatSchema);
