import { useAddressStatsWorker } from './agenda';
import { useDb } from './db';
import { sleep } from './timing';

const ADDRESS_BACKOFF_SECONDS = 5;

export async function getAddress(id) {
  const { Address } = await useDb();

  return await Address.findById(id);
}

export async function getOrPopulateAddress(id) {
  const { Address } = await useDb();

  let address = await getAddress(id);
  if (!address) {
    address = new Address({ _id: id });
    await address.save();
  }

  if (address.isPopulated) {
    return address;
  }

  const job = useAddressStatsWorker().create('AddressStatsWorker', { id: address._id });
  job.unique({ 'data.id': address._id });
  await job.save();
  await sleep(ADDRESS_BACKOFF_SECONDS);
  return await getOrPopulateAddress(id);
}

export async function getTransactions(query) {
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
