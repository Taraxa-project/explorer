const axios = require('axios');
const config = require('config');

module.exports = {
    request(name, params = [], id = 0) {
        return {
            jsonrpc: '2.0',
            id,
            method: name,
            params: params
        };
    },
    async send(request) {
        const response = await axios.post(config.taraxa.node.http, request);
        return response.data?.result || {};
    }
};