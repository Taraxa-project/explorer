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
                const activity = await Promise.all([
                    Tx.aggregate([
                        {$match: {to: id}},
                        {$group: {_id: id, value: {$sum: '$value'}}}
                    ]),
                    Tx.aggregate([
                        {$match: {from: id}},
                        {
                            $group: {
                                _id: id, 
                                gas: {
                                    $sum: {
                                        $multiply: ['$gas', '$gasPrice']
                                    }
                                },
                                value: {
                                    $sum: '$value'
                                }
                            }
                        }
                    ]),
                    Tx.find({
                        $or: [{from: id}, {to: id}]
                    })
                        .sort({timestamp: sortOrder})
                        .skip(skip)
                        .limit(limit)
                ]);
            
                const received = activity[0];
                const sent = activity[1];
                const transactions = activity[2];
                let totalSent = 0;
                let totalRecieved = 0;
                let totalGas = 0;
                if (received.length) {
                    totalRecieved = received[0].value;
                }
                if (sent.length) {
                    totalSent = totalSent + sent[0].value;
                    totalGas = totalGas + sent[0].gas;
                }
                return res.json({
                    address,
                    sent: totalSent,
                    received: totalRecieved,
                    fees: totalGas,
                    balance: totalRecieved - totalSent - totalGas,
                    transactions
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
