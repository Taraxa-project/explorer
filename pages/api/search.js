import config from 'config';
import mongoose from 'mongoose';

import DagBlock from '../../models/dag_block';
import Block from '../../models/block';
import Tx from '../../models/tx';

import utils from 'web3-utils'

export default async function handler(req, res) {
    try {
        mongoose.connection._readyState || await mongoose.connect(config.mongo.uri, config.mongo.options);
    } catch (e) {
        console.error(e);
        return res.status(500).json({error: 'Internal error. Please try your request again.'});
    }

    let queryString = req.query.query || "";
    queryString = queryString.trim();

    try {
        let blocks = [];
        let dagBlocks = [];
        let txs = [];

        if (queryString) {
            if(utils.isHexStrict(queryString)){
                const hex = queryString.toLowerCase();
                blocks = await Block.find({_id: hex}).limit(1);
                dagBlocks = await DagBlock.find({_id: hex}).limit(1);
                txs = await Tx.find({_id: hex}).limit(1);
            } else {
                blocks = await Block.find({number: Number(queryString)}).limit(1);
                dagBlocks = await DagBlock.find({level: Number(queryString)}).limit(1);
            }
        }
        
        res.json({
            blocks,
            dagBlocks,
            txs
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Internal error. Please try your request again.'});
    }
}
