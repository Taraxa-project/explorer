const mongoose = require('mongoose');

const Tx = new mongoose.Schema({
    _id: {type: String}, // tx hash
    blockHash: {type: String, ref: 'Block', index: true},
    blockNumber: {type: Number, index: true},
    from: {type: String, index: true},
    gas: {type: Number},
    gasPrice: {type: Number},
    input: {type: String},
    nonce: {type: Number},
    to: {type: String, index: true},
    transactionIndex: {type: Number},
    value: {type: Number},

    //not in rpc
    timestamp: {type: Date, default: Date.now} //override with block timestamp on finality
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

Tx.methods.toRPC = function toRPC() {
    const json = this.toJSON();

    // using hash as primary key
    json.hash = this._id;
    delete json._id;

    // delete non standard key
    delete json.timestamp;

    const hexKeys = ['blockNumber', 'gas', 'gasPrice', 'nonce', 'value'];
    hexKeys.forEach(key => {
        if (this[key]) {
            json[key] = this[key].toString(16);
        }
    });

    return json;
};

module.exports = mongoose.models?.Tx || mongoose.model('Tx', Tx);