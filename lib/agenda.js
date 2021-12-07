const config = require('config');
const Agenda = require('agenda');

function useAddressStatsWorker() {
  return useAgenda('addressStatsJobs');
}

function useAgenda(collection) {
  let agendaConfig = Object.assign({}, config.agenda);
  agendaConfig.db.collection = collection;

  return new Agenda(agendaConfig);
}

module.exports = { useAgenda, useAddressStatsWorker };
