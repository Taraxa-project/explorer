import config from 'config';
import mongoose from 'mongoose';

import Block from '../../../models/block'
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
    let sortOrder = req.query.reverse ? 1 : -1;

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
                    Block.aggregate([
                        {$match: {miner: id}},
                        {$group: {_id: id, value: {$sum: '$gasUsed'}}}
                    ]),
                    Tx.find({
                        $or: [{from: id}, {to: id}]
                    })
                        .sort({timestamp: sortOrder})
                        .skip(skip)
                        .limit(limit),
                    Tx.countDocuments({
                        $or: [{from: id}, {to: id}]
                    })
                ]);
            
                const received = activity[0];
                const sent = activity[1];
                const mined = activity[2];
                const transactions = activity[3];
                const count = activity[4];
        
                let totalSent = 0;
                let totalRecieved = 0;
                let totalMined = 0;
                let totalGas = 0;
                if (received.length) {
                    totalRecieved = received[0].value;
                }
                if (sent.length) {
                    totalSent = totalSent + sent[0].value;
                    totalGas = totalGas + sent[0].gas;
                }
                if (mined.length) {
                    totalMined = totalMined + mined[0].value;
                }
                return res.json({
                    address: id,
                    sent: totalSent,
                    received: totalRecieved,
                    mined: totalMined,
                    fees: totalGas,
                    balance: totalRecieved + totalMined - totalSent - totalGas,
                    transactions,
                    count
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
