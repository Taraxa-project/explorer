import config from 'config';
import mongoose from 'mongoose';

import Block from '../models/block';
import Tx from '../models/tx';

export async function getAddress(query) {
  try {
    mongoose.connection._readyState ||
      (await mongoose.connect(config.mongo.uri, config.mongo.options));

    const { id, skip, limit, sortOrder } = query;

    const activity = await Promise.all([
      Tx.aggregate([
        { $match: { to: id, status: true } },
        { $group: { _id: id, value: { $sum: '$value' } } },
      ]),
      Tx.aggregate([
        { $match: { from: id, status: true } },
        {
          $group: {
            _id: id,
            value: {
              $sum: '$value',
            },
          },
        },
      ]),
      Tx.aggregate([
        { $match: { from: id } },
        {
          $group: {
            _id: id,
            gas: {
              $sum: {
                $multiply: ['$gasUsed', '$gasPrice'],
              },
            },
          },
        },
      ]),
      Block.aggregate([
        { $match: { author: id } },
        { $group: { _id: '$author', count: { $sum: 1 } } },
      ]),
      Block.find({
        author: id,
      })
        .sort({ timestamp: -1 })
        .limit(1),
      Block.aggregate([
        { $match: { author: id } },
        { $group: { _id: id, value: { $sum: '$gasUsed' } } },
      ]),
      Tx.find({
        $or: [{ from: id }, { to: id }],
      })
        .sort({ timestamp: sortOrder })
        .skip(skip)
        .limit(limit),
      Tx.countDocuments({
        $or: [{ from: id }, { to: id }],
      }),
    ]);

    const received = activity[0];
    const sent = activity[1];
    const gas = activity[2];
    const produced = activity[3];
    let lastMinedBlockDate = activity[4];
    const minedGas = activity[5];
    const transactions = activity[6];
    const count = activity[7];

    let totalSent = 0;
    let totalRecieved = 0;
    let totalProduced = 0;
    let totalMinedGas = 0;
    let totalGas = 0;
    if (received.length) {
      totalRecieved = received[0].value;
    }
    if (sent.length) {
      totalSent = sent[0].value;
    }
    if (gas.length) {
      totalGas = gas[0].gas;
    }
    if (produced.length) {
      totalProduced = produced[0].count;
    }
    if (lastMinedBlockDate.length) {
      lastMinedBlockDate = lastMinedBlockDate[0].timestamp;
    } else {
      lastMinedBlockDate = null;
    }
    if (minedGas.length) {
      totalMinedGas = minedGas[0].value;
    }
    return {
      address: id,
      sent: totalSent,
      received: totalRecieved,
      produced: totalProduced,
      lastMinedBlockDate,
      fees: totalGas,
      balance: totalRecieved + totalMinedGas - totalSent - totalGas,
      transactions,
      count,
    };
  } catch (e) {
    console.error(e);
    e.status = 500;
    throw e;
  }
}
