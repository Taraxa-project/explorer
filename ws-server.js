const config = require('config');
const mongoose = require('mongoose');
const WebSocket = require('ws');

const LogNetworkEvent = require('./models/log_network_event');

(async () => {
    await mongoose.connect(config.mongo.uri, config.mongo.options);

    const wsServer = new WebSocket.Server({
        port: 3001
    });

    const now = new mongoose.Types.ObjectId();
    const events = LogNetworkEvent.find({_id: {$gte: now}}).tailable().cursor().addCursorFlag('noCursorTimeout', true);
    events
        .on('data', logEvent => {
            const e = logEvent.toJSON();
            wsServer.clients.forEach(client => {
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
