const config = require('config');
const Agenda = require('agenda');

let addressStatsWorker;

async function enqueuePopulateAddress(id) {
  console.log(`Enqueuing population of Address(${id})`);
  const agenda = await useReadyAddressStatsWorker();
  const job = agenda.create('AddressStatsWorker', { id });
  job.unique({ 'data.id': id });
  await job.save();
  return job;
}

async function useReadyAddressStatsWorker() {
  const worker = useAddressStatsWorker();
  await worker._ready;
  return worker;
}

function useAddressStatsWorker() {
  if (addressStatsWorker) {
    return addressStatsWorker;
  }
  addressStatsWorker = useAgenda('addressStatsJobs');
  return addressStatsWorker;
}

function useAgenda(collection) {
  let agendaConfig = Object.assign({}, config.agenda);
  agendaConfig.db.collection = collection;

  return new Agenda(agendaConfig);
}

module.exports = {
  useAgenda,
  useAddressStatsWorker,
  useReadyAddressStatsWorker,
  enqueuePopulateAddress,
};
