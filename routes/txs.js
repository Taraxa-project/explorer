const express = require('express');
const router = express.Router();

const Tx = require('../models/tx');

router.get('/txs', async (req, res) => {
    let skip = Number(req.query.skip) || 0;
    let limit = Number(req.query.limit) || 20;
    try {
        const txs = await Tx.find().limit(limit).skip(skip).sort({timestamp: 1});
        res.json(txs);
    } catch (e) {
        console.error(e);
        res.json({error: 'Internal error. Please try your request again.'}).status(500);
    }
});

router.get('/tx/:hash', async (req, res) => {
    try {
        const tx = await Tx.findOne({_id: req.params.hash});
        if (tx) {
            return res.json(tx);
        }
        return res.json({error: 'Not found'}).statusCode(404);
    } catch (e) {
        console.error(e);
        res.json({error: 'Internal error. Please try your request again.'}).status(500);
    }
});

module.exports = router;