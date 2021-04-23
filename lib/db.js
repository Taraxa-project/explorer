import config from "config";
import mongoose from "mongoose";

import Block from "../models/block";
import Tx from "../models/tx";
import Node from "../models/node";

export async function getAddress(query) {
  try {
    mongoose.connection._readyState ||
      (await mongoose.connect(config.mongo.uri, config.mongo.options));

    const { id, skip, limit, sortOrder } = query;

    const activity = await Promise.all([
      Tx.aggregate([
        { $match: { to: id, status: true } },
        { $group: { _id: id, value: { $sum: "$value" } } },
      ]),
      Tx.aggregate([
        { $match: { from: id, status: true } },
        {
          $group: {
            _id: id,
            value: {
              $sum: "$value",
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
                $multiply: ["$gasUsed", "$gasPrice"],
              },
            },
          },
        },
      ]),
      Node.find({ _id: id }),
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
    const mined = activity[3];
    const transactions = activity[4];
    const count = activity[5];

    let totalSent = 0;
    let totalRecieved = 0;
    let totalMined = 0;
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
    if (mined.length) {
      totalMined = mined[0].blocks;
    }
    return {
      address: id,
      sent: totalSent,
      received: totalRecieved,
      mined: totalMined,
      fees: totalGas,
      balance: totalRecieved + totalMined - totalSent - totalGas,
      transactions,
      count,
    };
  } catch (e) {
    console.error(e);
    e.status = 500;
    throw e;
  }
}
