const mongoose = require("mongoose");

const Delegate = new mongoose.Schema(
  {
    _id: { type: String },
    value: { type: String, default: "0" },
    created: { type: Date, default: Date.now, index: true },
  },
  {
    versionKey: false,
  }
);

module.exports =
  mongoose.models.Delegate || mongoose.model("Delegate", Delegate);
