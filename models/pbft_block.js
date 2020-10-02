const mongoose = require('mongoose');

const PBFTBlock = new mongoose.Schema({
    _id: {type: String},
    period: {type: Number, unique: true},
    timestamp: {type: Date, default: Date.now},
    beneficiary: {type: String},
    dag_block_hash_as_pivot: {type: String, ref: 'DAGBlock'},
    schedule: {
        dag_blocks_order: [{type: String, ref: 'DAGBlock'}]
    },
    signature: {type: String},
}, {
    versionKey: false
});

module.exports = mongoose.models.PBFTBlock || mongoose.model('PBFTBlock', PBFTBlock);