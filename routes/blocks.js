const express = require('express');
const router = express.Router();

const Block = require('../models/block');

router.get('/blocks', async (req, res) => {
    let skip = Number(req.query.skip) || 0;
    let limit = Number(req.query.limit) || 20;
    let reverse = Boolean(req.query.reverse);

    try {
        const blocks = await Block.find().limit(limit).skip(skip).sort({number: reverse ? -1 : 1});
        res.json(blocks);
    } catch (e) {
        console.error(e);
        res.json({error: 'Internal error. Please try your request again.'}).status(500);
    }
});

router.get('/block/:hash', async (req, res) => {
    try {
        const block = await Block.findOne({_id: req.params.hash});
        if (block) {
            return res.json(block);
        }
        return res.json({error: 'Not found'}).statusCode(404);
    } catch (e) {
        console.error(e);
        res.json({error: 'Internal error. Please try your request again.'}).status(500);
    }
});

module.exports = router;