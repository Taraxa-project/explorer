const mongoose = require('mongoose');

const Address = new mongoose.Schema(
  {
    _id: { type: String }, // address hash
    sent: { type: Number, default: 0 },
    received: { type: Number, default: 0 },
    produced: { type: Number, default: 0 },
    fees: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

module.exports = mongoose.models?.Address || mongoose.model('Address', Address);
