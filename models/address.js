const mongoose = require('mongoose');

const Address = new mongoose.Schema(
  {
    _id: { type: String }, // address hash
    isPopulated: { type: Boolean, default: false },
    blocksProduced: { type: Number, default: 0 },
    gasProduced: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    received: { type: Number, default: 0 },
    fees: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

module.exports = mongoose.models?.Address || mongoose.model('Address', Address);
