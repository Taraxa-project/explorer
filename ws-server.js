const config = require('config');
const mongoose = require('mongoose');
const WebSocket = require('ws');

const LogNetworkEvent = require('./models/log_network_event');

(() => {
    await mongoose.connect(config.mongo.uri, config.mongo.options);

    const wsServer = new WebSocket.Server();

    const now = new mongoose.Types.ObjectId();
    const newDagBlocks = LogNetworkEvent.find({_id: {$gte: now}}).tailable().stream();
    newDagBlocks
        .on('data', logEvent => {
            wsServer.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(logEvent);
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
