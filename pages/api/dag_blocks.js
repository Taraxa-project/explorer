import config from 'config';
import mongoose from 'mongoose';

import Block from '../../models/dag_block';

export default async function handler(req, res) {
    try {
        mongoose.connection._readyState || await mongoose.connect(config.mongo.uri, config.mongo.options);
    } catch (e) {
        console.error(e);
        return res.status(500).json({error: 'Internal error. Please try your request again.'});
    }

    let skip = Number(req.query.skip) || 0;
    let limit = Number(req.query.limit) || 20;
    let reverse = Boolean(req.query.reverse);
    let fullTransactions = Boolean(req.query.fullTransactions) || false;

    try {
        let blocks = [];
        if (fullTransactions) {
            blocks = await Block.find().limit(limit).skip(skip).sort({level: reverse ? -1 : 1}).populate('transactions');
        } else {
            blocks = await Block.find().limit(limit).skip(skip).sort({level: reverse ? -1 : 1});
        }
        res.json(blocks);
    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Internal error. Please try your request again.'});
    }
}