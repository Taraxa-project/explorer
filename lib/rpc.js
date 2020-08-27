const axios = require('axios');
const config = require('config');

function request(name, params = [], id = 0) {
    return {
        jsonrpc: '2.0',
        id,
        method: name,
        params: params
    };
}

async function send(request) {
    const response = await axios.post(config.taraxa.node.http, request);
    return response.data?.result || {};
}

async function netVersion() {
    return send(request('net_version'))
}

async function netPeerCount() {
    return send(request('net_peerCount'));
}

async function getBlockByHash(hash, fullTransactions = false) {
    return send(request('eth_getBlockByHash', [hash, fullTransactions]));
}

async function getBlockByNumber(number, fullTransactions = false) {
    return send(request('eth_getBlockByNumber', [number, fullTransactions]));
}

async function blockNumber() {
    return send(request('eth_blockNumber', []));
}

async function getDagBlockLevel(level) {
    return send(request('taraxa_getDagBlockLevel', []));

}

async function getDagBlockByLevel(level) {
    return send(request('taraxa_getDagBlockByLevel', [level.toString(16), false]));
}

module.exports = {
    request,
    send,

    netVersion,
    netPeerCount,
    getBlockByHash,
    getBlockByNumber,
    blockNumber,
    getDagBlockLevel,
    getDagBlockByLevel
};