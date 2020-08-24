const express = require('express');
const router = express.Router();

const Tx = require('../models/tx');

async function getAddress(req, res) {
    let skip = Number(req.query.skip) || 0;
    let limit = Number(req.query.limit) || 20;
    let sortOrder = req.query.reverse ? -1 : 1;

    const activity = await Promise.all([
        Tx.aggregate([
            {$match: {to: req.params.address}},
            {$group: {_id: req.params.address, value: {$sum: '$value'}}}
        ]),
        Tx.aggregate([
            {$match: {from: req.params.address}},
            {$group: {_id: req.params.address, gas: {$sum: '$gas'}, value: {$sum: '$value'}}}
        ]),
        Tx.find({
            $or: [{from: req.params.address}, {to: req.params.address}]
        })
            .sort({timestamp: sortOrder})
            .skip(skip)
            .limit(limit)
    ]);

    const received = activity[0];
    const sent = activity[1];
    const transactions = activity[2];

    return res.json({
        address: req.params.address,
        balance: received.value - sent.value - sent.gas,
        transactions
    });
}

router.get('/address/:address', getAddress);
router.get('/account/:address', getAddress); //deprecated

module.exports = router;