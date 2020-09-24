const mongoose = require('mongoose');

const Tx = new mongoose.Schema({
    _id: {type: String}, // tx hash
    blockHash: {type: String, ref: 'Block', index: true},
    blockNumber: {type: Number, index: true},
    from: {type: String, index: true},
    gas: {type: Number, default: 0},
    gasPrice: {type: Number, default: 0},
    input: {type: String},
    nonce: {type: Number, default: 0},
    to: {type: String, index: true},
    transactionIndex: {type: Number, default: 0},
    value: {type: Number, default: 0},

    //not in rpc
    timestamp: {type: Date, default: Date.now},

    //from receipt
    contractAddress: {type: String,},
    cumulativeGasUsed: {type: Number},
    gasUsed: {type: Number},
    status: {type: Boolean},
});

Tx.statics.fromRPC = function fromRPC(data) {
    const json = Object.assign({}, data);
    // using hash as primary key
    json._id = json.hash;
    delete json.hash;

    const hexKeys = ['blockNumber', 'gas', 'gasPrice', 'nonce', 'value', 'timestamp'];
    hexKeys.forEach(key => {
        if (json[key]) {
            json[key] = parseInt(json[key], 16);
        }
        if (key === 'timestamp') {
            json[key] = json[key] * 1000;
        }
    });

    return new this(json);
};

module.exports = mongoose.models?.Tx || mongoose.model('Tx', Tx);