const mongoose = require('mongoose');

const WorkQueue = new mongoose.Schema({
    jobName: {type: String, index: true},
    attempts: {type: Number, default: 0},
    maxAttempts: {type: Number, default: 1},
    created: {type: Date, default: Date.now, index: true},
    completed: {type: Date, expires: 3600}, // auto remove after completion
    expires: {type: Date, expires: 3600}, // auto remove after expiration
    started: {type: Date, index: true},
    status: {type: String, index: true, enum: ['new', 'processing', 'complete', 'error'], default: 'new'},
    worker: {type: String},
});

module.exports = mongoose.model('WorkQueue', WorkQueue);