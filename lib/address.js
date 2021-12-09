const utils = require('web3-utils');
const { useReadyAddressStatsQueue } = require('./job-queue');
const { useDb } = require('./db');
const { sleep } = require('./timing');

const ADDRESS_BACKOFF_SECONDS = 5;
const MAX_ATTEMPTS = 5;

async function enqueuePopulateAddress(id) {
  if (!utils.isAddress(id)) {
    return null;
  }

  console.log(`Enqueuing population of Address(${id})`);
  const jobQueue = await useReadyAddressStatsQueue();
  const job = jobQueue.create('AddressStats', { id });
  job.unique({ 'data.id': id });
  await job.save();

  return job;
}

async function getAddress(id) {
  if (!utils.isAddress(id)) {
    return null;
  }

  const { Address } = await useDb();
  return await Address.findById(id);
}

async function getPopulatedAddress(id, attempt = 0) {
  if (!utils.isAddress(id)) {
    return null;
  }
  if (attempt >= MAX_ATTEMPTS) {
    return null;
  }

  const { Address } = await useDb();

  let address = await getAddress(id);
  if (!address) {
    address = new Address({ _id: id });
    await address.save();
  }

  if (address.isPopulated) {
    return address;
  }

  await enqueuePopulateAddress(address._id);
  await sleep(ADDRESS_BACKOFF_SECONDS);
  return await getPopulatedAddress(id, attempt + 1);
}

async function getTransactions(query) {
  try {
    const { Tx } = await useDb();
    const { id, skip, limit, sortOrder } = query;

    const [transactions, total] = await Promise.all([
      Tx.find({ $or: [{ from: id }, { to: id }] })
        .sort({ timestamp: sortOrder })
        .skip(skip)
        .limit(limit),
      Tx.countDocuments({ $or: [{ from: id }, { to: id }] }),
    ]);

    return { transactions, total };
  } catch (e) {
    console.error(e);
    throw e;
  }
}

module.exports = { getAddress, getPopulatedAddress, getTransactions, enqueuePopulateAddress };
