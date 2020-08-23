const mongoose = require('mongoose');

const LogNetworkEvent = new mongoose.Schema({
    log: {type: String, required: true},
    timestamp: {type: Date, default: Date.now},
    data: {type: mongoose.Schema.Types.Mixed}
}, {
    capped: true,
    size: 1024 * 2000,
    versionKey: false
});

module.exports = mongoose.model('LogNetworkEvent', LogNetworkEvent);