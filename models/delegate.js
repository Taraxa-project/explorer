const mongoose = require("mongoose");

const Delegate = new mongoose.Schema(
  {
    _id: { type: String },
    counterpart: {
      type: String,
      default: "0x0000000000000000000000000000000000000000",
    },
    valueToAdd: { type: String, default: "0" },
    valueToSubstract: { type: String, default: "0" },
    total: { type: String, default: "0" },
    status: {
      type: String,
      enum: ["QUEUED", "FINISHED"],
      default: "QUEUED",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Delegate || mongoose.model("Delegate", Delegate);
