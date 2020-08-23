const mongoose = require('mongoose');

const DAGBlock = new mongoose.Schema({
    _id: {type: String}, // dag block hash
    level: {type: Number, index: true},
    period: {type: Number},
    pivot: {type: String},
    sender: {type: String, index: true},
    sig: {type: String},
    timestamp: {type: Date, index: true},
    tips: [{type: String}],
    transactions: [{type: String, ref: 'Tx'}],
    vdf: {type: String},
}, {
    versionKey: false
});

DAGBlock.statics.fromRPC = function fromRPC(json) {
    // using hash as primary key
    json._id = json.hash;
    delete json.hash;

    const hexKeys = ['level', 'period', 'timestamp'];
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

DAGBlock.methods.toRPC = function toRPC() {
    const json = this.toJSON();

    // using hash as primary key
    json.hash = this._id;
    delete json._id;

    const hexKeys = ['level', 'period', 'timestamp'];
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

module.exports = mongoose.model('DAGBlock', DAGBlock);