import { useDb } from './db';

export async function getAddress(query) {
  try {
    const { Block, Tx } = await useDb();
    const { id, skip, limit, sortOrder } = query;

    const activity = await Promise.all([
      Tx.aggregate([
        { $match: { to: id, status: true } },
        { $group: { _id: '$to', value: { $sum: '$value' } } },
      ]).hint({ to: 1, status: 1, value: 1 }),
      Tx.aggregate([
        { $match: { from: id, status: true } },
        { $group: { _id: '$from', value: { $sum: '$value' } } },
      ]).hint({ from: 1, status: 1, value: 1 }),
      Tx.aggregate([
        { $match: { from: id } },
        { $group: { _id: '$from', gas: { $sum: { $multiply: ['$gasUsed', '$gasPrice'] } } } },
      ]).hint({ from: 1, gasUsed: 1, gasPrice: 1 }),
      Block.aggregate([
        { $match: { author: id } },
        { $group: { _id: '$author', count: { $sum: 1 } } },
      ]),
      Block.aggregate([
        { $match: { author: id } },
        { $group: { _id: '$author', value: { $sum: '$gasUsed' } } },
      ]).hint({ author: 1, gasUsed: 1 }),
      Tx.find({ $or: [{ from: id }, { to: id }] })
        .sort({ timestamp: sortOrder })
        .skip(skip)
        .limit(limit),
      Tx.countDocuments({ $or: [{ from: id }, { to: id }] }),
    ]);

    const received = activity[0];
    const sent = activity[1];
    const gas = activity[2];
    const produced = activity[3];
    const minedGas = activity[4];
    const transactions = activity[5];
    const count = activity[6];

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
    if (minedGas.length) {
      totalMinedGas = minedGas[0].value;
    }
    return {
      address: id,
      sent: totalSent,
      received: totalRecieved,
      produced: totalProduced,
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
