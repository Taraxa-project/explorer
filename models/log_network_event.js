const mongoose = require('mongoose');

const LogNetworkEvent = new mongoose.Schema(
  {
    log: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now },
    data: { type: mongoose.Schema.Types.Mixed },
  },
  {
    capped: {
      size: 1024 * 2000,
      autoIndexId: true,
    },
    versionKey: false,
  },
);

module.exports =
  mongoose.models?.LogNetworkEvent || mongoose.model('LogNetworkEvent', LogNetworkEvent);
