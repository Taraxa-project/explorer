const moment = require('moment');
const utils = require('web3-utils');
const { getAddress } = require('../lib/address');
const { useAddressStatsWorker } = require('../lib/agenda');
const { useDb } = require('../lib/db');

const agenda = useAddressStatsWorker();

agenda.define('AddressStatsWorker', async (job) => {
  try {
    const { id } = job.attrs.data;
    if (!utils.isHexStrict(id)) {
      console.log(`Skipping address stats for invalid ${id}`);
    }

    console.log(`Processing address stats for ${id}`);
    const { Address, Block, Tx } = await useDb();

    const now = moment();
    let address = await getAddress(id);
    if (!address) {
      console.log(`Creating new address stats for ${id}`);
      address = new Address({ _id: id, updatedAt: now.toDate(), createdAt: now.toDate() });
    }

    console.log(`Running aggregations for address stats for ${id}`);

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
    console.log(`Saving fresh stats for ${id}`);
    await address.save();
  } catch (e) {
    console.error(e);
    throw e;
  }
});

(async function () {
  await agenda._ready;
  await agenda.start();
})();
