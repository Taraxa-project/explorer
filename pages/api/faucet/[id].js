import config from 'config';
import mongoose from 'mongoose';

import Faucet from '../../../models/faucet';

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

    try {
        await Faucet.findOneAndUpdate({address: id}, {address: id}, {upsert: true, new: true});
        res.json({
            status: `Address ${id} is in faucet queue.`
        })
    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Internal error. Please try your request again.'});
    }
            
}
