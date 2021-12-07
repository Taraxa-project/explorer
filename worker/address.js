const moment = require('moment');
const { useAddressStatsWorker } = require('../lib/agenda');
const { useDb } = require('../lib/db');

const MAX_ADDRESS_STALE_SECONDS = 5;

const agenda = useAddressStatsWorker();

agenda.define('AddressStatsWorker', async (job) => {
  try {
    const { Address, Block, Tx } = await useDb();
    const { id } = job.attrs.data;
    const now = moment();
    let address = await Address.findById(id);
    if (!address) {
      address = new Address({ _id: id, updatedAt: now.toDate(), createdAt: now.toDate() });
    }

    if (address.isPopulated && now.diff(address.updatedAd, 'seconds') < MAX_ADDRESS_STALE_SECONDS) {
      return;
    }

    const [receivedResult, sentResult, feesResult, blocksProducedResult, gasProducedResult] =
      await Promise.all([
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
      ]);

    address.sent = sentResult.length ? sentResult[0].value : 0;
    address.received = receivedResult.length ? receivedResult[0].value : 0;
    address.fees = feesResult.length ? feesResult[0].gas : 0;
    address.blocksProduced = blocksProducedResult.length ? blocksProducedResult[0].count : 0;
    address.gasProduced = gasProducedResult.length ? gasProducedResult[0].value : 0;
    address.balance = address.received + address.gasProduced - address.sent - address.fees;
    address.isPopulated = true;

    await address.save();
  } catch (e) {
    console.error(e);
    throw e;
  }
});

(async function () {
  await agenda.start();
})();
