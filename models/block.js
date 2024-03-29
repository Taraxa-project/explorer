const mongoose = require('mongoose');

const Block = new mongoose.Schema(
  {
    _id: { type: String }, // block hash
    author: { type: String, index: true },
    extraData: { type: String },
    gasLimit: { type: Number },
    gasUsed: { type: Number },
    logsBloom: { type: String },
    mixHash: { type: String },
    nonce: { type: Number },
    number: { type: Number, unique: true },
    parentHash: { type: String },
    receiptsRoot: { type: String },
    reward: { type: Number, default: 0 },
    sha3Uncles: { type: String },
    size: { type: Number },
    stateRoot: { type: String },
    timestamp: { type: Date, index: true },
    totalDifficulty: { type: Number },
    transactions: [{ type: String, ref: 'Tx' }],
    transactionsRoot: { type: String },
    uncles: [{ type: String }],
  },
  {
    versionKey: false,
  },
);

Block.statics.fromRPC = function fromRPC(data) {
  const json = Object.assign({}, data);
  // move hash to primary key _id
  json._id = json.hash;
  delete json.hash;

  const hexKeys = ['gasLimit', 'gasUsed', 'nonce', 'number', 'size', 'timestamp'];
  hexKeys.forEach((key) => {
    if (json[key]) {
      json[key] = parseInt(json[key], 16);
    }
    if (key === 'timestamp') {
      json[key] = json[key] * 1000;
    }
  });

  if (json.transactions && json.transactions.length) {
    json.transactions = json.transactions.map((doc) => doc.hash || doc);
  }

  return new this(json);
};

Block.index({ timestamp: -1 }, { background: true });
Block.index({ author: 1, gasUsed: 1 }, { background: true, sparse: true });
Block.index({ author: 1, timestamp: -1 }, { background: true });
Block.index({ author: 1, timestamp: 1 }, { background: true });
Block.index({ timestamp: 1, _id: 1 }, { background: true });
Block.index({ timestamp: -1, _id: 1 }, { background: true });
Block.index({ author: 1, timestamp: 1, _id: 1 }, { background: true });
Block.index({ author: 1, timestamp: -1, _id: 1 }, { background: true });

module.exports = mongoose.models?.Block || mongoose.model('Block', Block);
