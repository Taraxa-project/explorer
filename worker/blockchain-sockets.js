#!/usr/bin/env node

const config = require('config');
const {fromEvent} = require('rxjs');
const WebSocket = require('ws');

const topics = ['newPendingTransactions', 'newDagBlocks', 'newDagBlocksFinalized', 'newPbftBlocks', 'newHeads'];
// const topics = ['newDagBlocks'];


let id = 0;
let subscriptionRequests = [];
let subscribed = {};

function rpcRequest(method, params = []) {
    return {jsonrpc: '2.0', id: id, method, params};
}

var ws = new WebSocket(config.taraxa.node.ws);
fromEvent(ws, 'message')
    .subscribe(function (o) {
        try {
            const jsonRpc = JSON.parse(o.data);
            if (subscriptionRequests[jsonRpc.id]) {
                console.log(`Subscribed to topic: ${  subscriptionRequests[jsonRpc.id].topic}`, jsonRpc.result);
                subscribed[jsonRpc.result] = subscriptionRequests[jsonRpc.id].topic;
            } else if (subscribed[jsonRpc.params?.subscription]) {
                console.log(subscribed[jsonRpc.params.subscription], jsonRpc.params.result);
            } else {
                console.log(jsonRpc);
            }
        } catch (e) {
            console.error(e, o.data);
        }
    });

ws.on('open', function () {
    topics.forEach((topic) => {
        subscriptionRequests[id.toString(16)] = {topic};
        const request = rpcRequest('eth_subscribe', [topic]);
        ws.send(JSON.stringify(request));
        console.log('Request', request);
        id ++;
    });
});

ws.on('close', function close() {
    console.log('socket disconnected');
    process.exit(1);
});




