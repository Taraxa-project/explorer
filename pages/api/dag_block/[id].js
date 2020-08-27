import config from 'config';
import mongoose from 'mongoose';

import Block from '../../../models/dag_block';

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

    let fullTransactions = Boolean(req.query.fullTransactions) || false;

    switch (method) {
        case 'GET':
            try {
                let block;
                if (fullTransactions) {
                    block = await Block.findOne({_id: id}).populate('transactions');
                } else {
                    block = await Block.findOne({_id: id});
                }

                if (block) {
                    return res.json(block);
                }
                return res.status(404).json({error: 'Not found'});
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
