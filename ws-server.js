const mongoose = require('mongoose');
const ws = require('ws');

const LogNetworkEvent = require('./models/log_network_event');

(() => {
    const wsServer = new ws.Server();
    const methods = {
        eth: {
            subscribe: 'eth_subscribe'
        }
    };
    const topics = ['newDagBlocks'];
    const subscriptions = {};
    let subscriptionCount = 0;
    topics.forEach(topic => {
        subscriptions[topic] = {};
    });
    let connectedSocketCount = 0;
    wsServer.on('connection', socket => {
        socket.id = connectedSocketCount;
        connectedSocketCount++;
        socket.on('message', message => {
            try {
                console.log('Socket Message', message);
                const json = JSON.parse(message);
                if (json.jsonrpc && json.method && json.params) {
                    if (json.method === methods.eth.subscribe) {
                        const topic = json.params[0];
                        if (topic && topics.includes(topic)) {
                            subscriptions[topic][socket.id] = {
                                socket,
                                number: subscriptionCount
                            };
                            subscriptionCount++;
                        }
                    }
                }
            } catch (e) {
                console.error('Got invalid websocket message', message);
            }
        });
    });

    const now = new mongoose.Types.ObjectId();
    const newDagBlocks = LogNetworkEvent.find({log: 'newDagBlocks', _id: {$gte: now}}).tailable().stream();
    newDagBlocks
        .on('data', logEvent => {
            Object.keys(subscriptions.newDagBlocks).forEach(sid => {
                const subscription = subscriptions.newDagBlocks[sid];

                if (subscription.socket.readyState === ws.OPEN) {
                    subscription.socket.send(JSON.stringify({
                        jsonrpc: '2.0',
                        method: 'eth_subscription',
                        params: {
                            subscription: subscription.number.toString(16),
                            result: logEvent.data
                        }
                    }));
                } else {
                    delete subscriptions.newDagBlocks[sid];
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
