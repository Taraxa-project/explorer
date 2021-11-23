#!/usr/bin/env node

const WebSocket = require('ws');
const { useDb } = require('./lib/db');

(async () => {
  const { LogNetworkEvent } = await useDb();

  const wsServer = new WebSocket.Server({
    port: 3001,
  });

  const newEvent = await new LogNetworkEvent({
    log: 'ws-server',
    data: { started: true },
  }).save();
  const now = newEvent._id;
  const events = LogNetworkEvent.find({ _id: { $gte: now } })
    .tailable()
    .cursor()
    .addCursorFlag('noCursorTimeout', true);
  events
    .on('data', (logEvent) => {
      const e = logEvent.toJSON();
      wsServer.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(e));
        }
      });
    })
    .on('error', function (e) {
      console.error(e);
      process.exit(1);
    })
    .on('close', function (status) {
      console.log(status);
      process.exit(1);
    });
})();
