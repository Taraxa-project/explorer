const mongoose = require('mongoose');

const Faucet = new mongoose.Schema({
    address: {type: String, unique: true},
    created: {type: Date, default: Date.now, index: true}
}, {
    versionKey: false
});

module.exports = mongoose.models.Faucet || mongoose.model('Faucet', Faucet);