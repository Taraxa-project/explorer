const mongoose = require('mongoose');

const Delegate = new mongoose.Schema(
  {
    node: {
      type: String,
      default: '0x0000000000000000000000000000000000000000',
    },
    counterpart: {
      type: String,
      default: '0x0000000000000000000000000000000000000000',
    },
    valueToAdd: { type: String, default: '0' },
    valueToSubstract: { type: String, default: '0' },
    status: {
      type: String,
      enum: ['QUEUED', 'FINISHED', 'ERROR'],
      default: 'QUEUED',
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

module.exports = mongoose.models.Delegate || mongoose.model('Delegate', Delegate);
