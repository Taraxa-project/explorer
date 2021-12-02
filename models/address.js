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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

Address.virtual('receivedTransactions', {
  ref: 'Tx',
  localField: '_id',
  foreignField: 'to',
});

Address.virtual('receivedTransactionsCount', {
  ref: 'Tx',
  localField: '_id',
  foreignField: 'to',
  count: true,
});

Address.virtual('sentTransactions', {
  ref: 'Tx',
  localField: '_id',
  foreignField: 'from',
});

Address.virtual('sentTransactionsCount', {
  ref: 'Tx',
  localField: '_id',
  foreignField: 'from',
  count: true,
});

module.exports = mongoose.models?.Address || mongoose.model('Address', Address);
