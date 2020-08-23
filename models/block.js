const mongoose = require('mongoose');

const Block = new mongoose.Schema({
    _id: {type: String}, // block hash
    author: {type: String},
    extraData: {type: String},
    gasLimit: {type: Number},
    gasUsed: {type: Number},
    logsBloom: {type: String},
    miner: {type: String},
    mixHash: {type: String},
    nonce: {type: Number},
    number: {type: Number, unique: true},
    parentHash: {type: String},
    receiptsRoot: {type: String},
    sha3Uncles: {type: String},
    size: {type: Number},
    stateRoot: {type: String},
    timestamp: {type: Date, index: true},
    totalDifficulty: {type: Number},
    transactions: [{type: String, ref: 'Tx'}],
    transactionsRoot: {type: String},
    uncles: [{type: String}]
}, {
    versionKey: false
});

Block.statics.fromRPC = function fromRPC(data) {
    const json = Object.assign({}, data);
    // move hash to primary key _id
    json._id = json.hash;
    delete json.hash;

    const hexKeys = ['gasLimit', 'gasUsed', 'nonce', 'number', 'size', 'timestamp'];
    hexKeys.forEach(key => {
        if (json[key]) {
            json[key] = parseInt(json[key], 16);
        }
        if (key === 'timestamp') {
            json[key] = json[key] * 1000;
        }
    });

    if (json.transactions && json.transactions.length) {
        json.transactions = json.transactions.map(doc => doc.hash || doc);
    }

    return new this(json);
};

Block.methods.toRPC = function toRPC() {
    const json = this.toJSON();

    // get hash from primary key _id
    json.hash = this._id;
    delete json._id;

    const hexKeys = ['gasLimit', 'gasUsed', 'nonce', 'number', 'size', 'timestamp'];
    hexKeys.forEach(key => {
        if (key === 'timestamp') {
            json[key] = this[key].valueOf() / 1000;
        }
        if (this[key]) {
            json[key] = this[key].toString(16);
        }
    });

    return json;
};

module.exports = mongoose.model('Block', Block);