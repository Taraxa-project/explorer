const config = require('config');
const mongoose = require('mongoose');

const DagBlock = require('../models/dag_block');
const Block = require('../models/block');
const Tx = require('../models/tx');

const LogNetworkEvent = require('../models/log_network_event');

const rpc = require('../lib/rpc');

async function getChainState() {
    const number =  await rpc.send(rpc.request('eth_blockNumber'));
    const firstBlock = await rpc.send(rpc.request('eth_getBlockByNumber', [Number(0).toString(16), false]));
    const lastBlock = await rpc.send(rpc.request('eth_getBlockByNumber', [number, false]));

    return {
        number: parseInt(number, 16),
        hash: lastBlock.hash,
        genesis: firstBlock.hash
    };
}

async function getSyncState() {
    const totalBlocks = await Block.countDocuments();
    const genesisBlocks = await Block.find({number: 0});
    const lastBlocks = await Block.find().sort({number: -1}).limit(1);

    const syncState = {
        hash: '',
        genesis: '',
        number: totalBlocks - 1
    };

    if (genesisBlocks.length) {
        if (genesisBlocks.length === 1) {
            syncState.genesis = genesisBlocks[0]._id;
        } else {
            console.error(new Error('More than one genesis block in database'));
        }
    }

    if (lastBlocks.length) {
        syncState.genesis = genesisBlocks[0]._id;
        syncState.hash = lastBlocks[0]._id;
    }

    return syncState;
}

async function dropChainData() {
    await DagBlock.deleteMany();
    await Block.deleteMany();
    await Tx.deleteMany();
}

async function getBlockByNumber(number) {
    const rpcBlock = await rpc.send(rpc.request('eth_getBlockByNumber', [number.toString(16), true]));
    return rpcBlock;
}

async function sync() {
    const chainState = await getChainState();
    let syncState = await getSyncState();
    let verifiedTip = false;

    // if genesis block changes, resync
    if (!chainState.genesis || chainState.genesis !== syncState.genesis) {
        console.log('New genesis block hash. Restarting chain sync.');
        await dropChainData();
        syncState = {
            number: -1,
            hash: '',
            genesis: ''
        };
        verifiedTip = true;
    }

    while (!verifiedTip) {
        const chainBlockAtSyncNumber = await getBlockByNumber(syncState.number);
        if (chainBlockAtSyncNumber.hash !== syncState.hash) {
            console.log('Block hash at height', syncState.number, 'has changed. Re-org detected, walking back.');
            await Block.deleteOne({_id: syncState.hash});
            await Tx.deleteMany({blockHash: syncState.hash});
            syncState = await getSyncState();
        } else {
            verifiedTip = true;
        }
    }

    // sync to tip
    while (syncState.number < chainState.number) {
        const block = await getBlockByNumber(syncState.number + 1);
        if (block.hash) {
            const started = new Date();
            // save tx first
            const bulkTx = [];
            for (const tx of block.transactions) {
                tx.timestamp = block.timestamp;
                bulkTx.push({
                    updateOne: {
                        filter: {_id: tx.hash},
                        update: Tx.fromRPC(tx).toJSON(),
                        upsert: true
                    }
                });
            }
            if (bulkTx.length) {
                await Tx.bulkWrite(bulkTx, {ordered: true});
            }
            await Block.findOneAndUpdate(
                {_id: block.hash},
                Block.fromRPC(block).toJSON(),
                {
                    upsert: true,
                }
            );

            const minBlock = Object.assign({}, block);
            minBlock.transactions = block.transactions.map(tx => tx.hash);

            // event notifications
            const notifications = [{
                insertOne: {
                    document: {
                        log: 'block',
                        data: minBlock
                    }
                }
            }];
            for (const tx of block.transactions) {
                notifications.push({
                    insertOne: {
                        document: {
                            log: 'tx',
                            data: tx
                        }
                    }
                });
            }
            await LogNetworkEvent.bulkWrite(notifications, {ordered: true});

            // update sync state
            syncState.number = parseInt(block.number, 16);
            syncState.genesis = chainState.genesis;
            syncState.hash = block.hash;

            const completed = new Date();
            console.log('Sync\'d block', syncState.number, syncState.hash, 'with', block.transactions.length, 'transactions, in', completed - started, 'ms');
        }
    }

    //TODO: switch to websocket to get realtime events instead of polling
    setTimeout(async () => {
        await doSync();
    }, 10 * 1000);
}

async function doSync() {
    try {
        await sync();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

(async () => {
    try {
        await mongoose.connect(config.mongo.uri, config.mongo.options);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }

    await doSync();
})();