const mongoose = require('mongoose');

const DAGBlock = new mongoose.Schema(
  {
    _id: { type: String }, // dag block hash
    level: { type: Number, index: true },
    period: { type: Number, index: true },
    pivot: { type: String },
    sender: { type: String, index: true },
    sig: { type: String },
    timestamp: { type: Date, index: true },
    tips: [{ type: String, ref: 'DAGBlock' }],
    transactions: [{ type: String, ref: 'Tx' }],
    vdf: { type: String },
  },
  {
    versionKey: false,
  },
);

DAGBlock.statics.fromRPC = function fromRPC(json) {
  // using hash as primary key
  json._id = json.hash;
  delete json.hash;

  const hexKeys = ['level', 'period', 'timestamp'];
  hexKeys.forEach((key) => {
    if (json[key]) {
      json[key] = parseInt(json[key], 16);
    }
    if (key === 'timestamp') {
      json[key] = json[key] * 1000;
    }
  });

  json.vdf = parseInt(json.vdf.difficulty, 16);

  return new this(json);
};

DAGBlock.index({ level: -1 }, { background: true });

module.exports = mongoose.models?.DAGBlock || mongoose.model('DAGBlock', DAGBlock);
