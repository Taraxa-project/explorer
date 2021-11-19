const mongoose = require('mongoose');

const _LogReader = new mongoose.Schema(
  {
    record: { type: mongoose.Schema.Types.ObjectId },
    log: { type: String },
    system: { type: String },
    filter: { type: String }, // stringified json
    expires: { type: Date, default: Date.now, expires: '7d' },
  },
  {
    versionKey: false,
  },
);

_LogReader.index(
  {
    log: 1,
    system: 1,
    filter: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model('_LogReader', _LogReader);
