const mongoose = require('mongoose');

const FaucetNonce = new mongoose.Schema(
  {
    nonce: { type: Number, default: 0 },
  },
  {
    versionKey: false,
  },
);

module.exports = mongoose.models?.FaucetNonce || mongoose.model('FaucetNonce', FaucetNonce);
