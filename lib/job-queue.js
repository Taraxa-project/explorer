const config = require('config');
const Agenda = require('agenda');

let addressStatsQueue;

async function useReadyAddressStatsQueue() {
  const queue = useAddressStatsQueue();
  await queue._ready;
  return queue;
}

function useAddressStatsQueue() {
  if (addressStatsQueue) {
    return addressStatsQueue;
  }
  addressStatsQueue = useAgenda('queueAddressStats');
  return addressStatsQueue;
}

function useAgenda(collection) {
  let queueConfig = Object.assign({}, config.jobQueue);
  queueConfig.db.collection = collection;
  return new Agenda(queueConfig);
}

module.exports = {
  useAgenda,
  useAddressStatsQueue,
  useReadyAddressStatsQueue,
};
