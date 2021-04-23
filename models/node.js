const mongoose = require("mongoose");

const Node = new mongoose.Schema(
  {
    _id: { type: String }, // address
    blocks: { type: Number, default: 0 },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.models.Node || mongoose.model("Node", Node);
