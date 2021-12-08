const { enqueuePopulateAddress } = require('./agenda');
const { useDb } = require('./db');
const { sleep } = require('./timing');

const ADDRESS_BACKOFF_SECONDS = 5;

async function getAddress(id) {
  const { Address } = await useDb();

  return await Address.findById(id);
}

async function getPopulatedAddress(id) {
  const { Address } = await useDb();

  let address = await getAddress(id);
  if (!address) {
    console.log(`Creating new Address(${id})`);
    address = new Address({ _id: id });
    await address.save();
  }

  if (address.isPopulated) {
    console.log(`Returning existing populated Address(${id})`);
    return address;
  }

  await enqueuePopulateAddress(address._id);

  console.log(`Awaiting population of Address(${id})`);
  await sleep(ADDRESS_BACKOFF_SECONDS);
  return await getPopulatedAddress(id);
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
