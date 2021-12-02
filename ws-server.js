#!/usr/bin/env node

const config = require('config');
const { Appsignal } = require('@appsignal/nodejs');

const appsignal = new Appsignal(config.appsignal);
const tracer = appsignal.tracer();
const rootSpan = tracer.createSpan({ namespace: 'background' }).setName('ws-server');

const WebSocket = require('ws');
const { useDb } = require('./lib/db');

const logNetworkEvents = async () => {
  tracer.withSpan(tracer.createSpan().setName('logNetworkEvents'), async (span) => {
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
        tracer.withSpan(tracer.createSpan().setName('logEvent'), (span) => {
          const e = logEvent.toJSON();
          wsServer.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(e));
            }
          });
          span.close();
        });
      })
      .on('error', function (e) {
        throw e;
      })
      .on('close', function (status) {
        console.log(status);
        span.close();
        appsignal.stop();
        process.exit(1);
      });
    span.close();
  });
};

tracer.withSpan(rootSpan, async (span) => {
  try {
    console.log('ws-server started');
    await logNetworkEvents();
  } catch (e) {
    console.error(e);
    tracer.setError(e);
    span.close();
    appsignal.stop();
    process.exit(1);
  }
});
