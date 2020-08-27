import config from 'config';
import mongoose from 'mongoose';

import Tx from '../../../models/tx';

export default async function userHandler(req, res) {
    try {
        mongoose.connection._readyState || await mongoose.connect(config.mongo.uri, config.mongo.options);
    } catch (e) {
        console.error(e);
        return res.status(500).json({error: 'Internal error. Please try your request again.'});
    }
    const {
        query: {id},
        method,
    } = req;

    let skip = Number(req.query.skip) || 0;
    let limit = Number(req.query.limit) || 20;
    let sortOrder = req.query.reverse ? -1 : 1;

    switch (method) {
        case 'GET':
            try {
                const txs = await Tx.find({$or: [{from: id}, {to: id}]}).limit(limit).skip(skip).sort({timestamp: sortOrder ? -1 : 1});
                return res.json({
                    address,
                    txs
                });
            } catch (e) {
                console.error(e);
                res.status(500).json({error: 'Internal error. Please try your request again.'});
            }
            break;
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
