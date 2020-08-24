#!/usr/bin/env node

const bodyParser = require('body-parser');
const config = require('config');
const express = require('express');
const mongoose = require('mongoose');
const swaggerJSDoc = require('swagger-jsdoc');
const ws = require('ws');

const LogNetworkEvent = require('./models/log_network_event');

const pkg = require('./package.json');

const options = {
    definition: {
        openapi: '3.0.0', // Specification (optional, defaults to swagger: '2.0')
        info: {
            title: pkg.name, // Title (required)
            version: pkg.version, // Version (required)
        },
    },
    // Path to the API docs
    apis: ['./routes/blocks', './routes/txs'],
};

// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const swaggerSpec = swaggerJSDoc(options);

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.use('/api', require('./routes'));

const wsServer = new ws.Server({noServer: true});
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

(async () => {
    try {
        await mongoose.connect(config.mongo.uri, config.mongo.options);

        const server = app.listen(config.port, () => {
            console.log(`Server listening at 0.0.0.0:${config.port}`);
        });

        server.on('upgrade', (request, socket, head) => {
            wsServer.handleUpgrade(request, socket, head, socket => {
                wsServer.emit('connection', socket, request);
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
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();

