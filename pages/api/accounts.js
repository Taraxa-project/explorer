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

    try {
        const uniqueAddressesByReceipt = await Tx.aggregate([
            {
                $group: {
                    _id: '$to',
                    receivedSum: {$sum: '$value'},
                    receivedMax: {$max: '$value'},
                    mostRecent: {$max: '$timestamp'}
                }
            },
            { $sort : { receivedSum : sortOrder } },
            { $skip : skip },
            { $limit : limit }
        ])
        console.log(uniqueAddressesByReceipt);
        res.json(uniqueAddressesByReceipt);
    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Internal error. Please try your request again.'});
    }
}
