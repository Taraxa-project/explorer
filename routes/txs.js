const express = require('express');
const router = express.Router();

const Tx = require('../models/tx');

async function getManyTxs(req, res) {
    let skip = Number(req.query.skip) || 0;
    let limit = Number(req.query.limit) || 20;
    let sortOrder = req.query.reverse ? -1 : 1;
    let blockHash = req.query.blockHash;

    try {
        const txs = await Tx.find({blockHash}).limit(limit).skip(skip).sort({timestamp: sortOrder ? -1 : 1});
        res.json(txs);
    } catch (e) {
        console.error(e);
        res.json({error: 'Internal error. Please try your request again.'}).status(500);
    }
}

async function getTx(req, res) {
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
}

router.get('/txs', getManyTxs );
router.get('/trxs', getManyTxs); //deprecated

router.get('/tx/:hash', getTx );
router.get('/trx/:hash', getTx);

module.exports = router;