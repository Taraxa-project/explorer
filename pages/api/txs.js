import config from 'config';
import mongoose from 'mongoose';

import Tx from '../../models/tx';

export default async function handler(req, res) {
    try {
        mongoose.connection._readyState || await mongoose.connect(config.mongo.uri, config.mongo.options);
    } catch (e) {
        console.error(e);
        return res.status(500).json({error: 'Internal error. Please try your request again.'});
    }

    let skip = Number(req.query.skip) || 0;
    let limit = Number(req.query.limit) || 20;
    let sortOrder = req.query.reverse ? -1 : 1;
    let blockHash = req.query.blockHash;

    const query = {};
    if (blockHash) {
        query.blockHash = blockHash;
    }

    try {
        const txs = await Tx.find(query).limit(limit).skip(skip).sort({timestamp: sortOrder ? -1 : 1});
        res.json(txs);
    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Internal error. Please try your request again.'});
    }
}
