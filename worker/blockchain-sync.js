#!/usr/bin/env node

const config = require('config');
const mongoose = require('mongoose');

const DagBlock = require('../models/dag_block');
const Block = require('../models/block');
const Tx = require('../models/tx');

const LogNetworkEvent = require('../models/log_network_event');

const {fromEvent} = require('rxjs');
const WebSocket = require('ws');

const rpc = require('../lib/rpc');

async function getChainState() {
    const numberHex =  await rpc.send(rpc.request('eth_blockNumber'));
    const number = parseInt(numberHex, 16);
    const blocks = await Promise.all([
        getBlockByNumber(0),
        getBlockByNumber(number),
        getDagBlocksByLevel(number)
    ]);
    const genesis = blocks[0];
    const block = blocks[1];
    const dagBlocks = blocks[2];

    // console.log('Block height onchain', number);
    // console.log('Genesis', genesis.hash);
    // console.log(`Block ${number}`, block.hash);

    return {
        number: number,
        hash: block.hash,
        genesis: genesis.hash,
        dagBlocks: dagBlocks.map((dagBlock => dagBlock.hash))
    };
}

async function getSyncState() {
    const blocks = await Promise.all([
        Block.find({number: 0}),
        Block.find().sort({number: -1}).limit(1)
    ]);
    const genesisBlocks = blocks[0];
    const lastBlocks = blocks[1];

    const syncState = {
        hash: '',
        genesis: '',
        number: -1,
        dagBlocks: []
    };

    let dagBlocks = [];

    if (lastBlocks[0]) {
        syncState.number = lastBlocks[0].number;
        dagBlocks = await DagBlock.find({number: lastBlocks[0].number});
    }

    if (genesisBlocks.length) {
        syncState.genesis = genesisBlocks[0]._id;
    }

    if (lastBlocks.length) {
        syncState.hash = lastBlocks[0]._id;
        syncState.dagBlocks = dagBlocks.map((dagBlock => dagBlock._id));
    }

    return syncState;
}

async function dropChainData() {
    await Promise.all([
        DagBlock.deleteMany(),
        Block.deleteMany(),
        Tx.deleteMany()
    ]);
}

async function getBlockByNumber(number, fullTransactions = false) {
    return rpc.send(rpc.request('eth_getBlockByNumber', [number.toString(16), fullTransactions]));
}
async function getDagBlocksByLevel(number, fullTransactions = false) {
    return rpc.send(rpc.request('taraxa_getDagBlockByLevel', [number.toString(16), fullTransactions]));
}

async function realtimeSync() {
    const topics = ['newPendingTransactions', 'newDagBlocks', 'newDagBlocksFinalized', 'newPbftBlocks', 'newHeads'];
    let id = 0;
    let subscriptionRequests = [];
    let subscribed = {};
    const ws = new WebSocket(config.taraxa.node.ws);
    fromEvent(ws, 'message')
    .subscribe(async function (o) {
        try {
            const jsonRpc = JSON.parse(o.data);
            // handle subscription request responses
            if (subscriptionRequests[jsonRpc.id]) {
                console.log(`Subscribed to ${subscriptionRequests[jsonRpc.id].topic}`);
                subscribed[jsonRpc.result] = subscriptionRequests[jsonRpc.id].topic;
            // handle subscription data
            } else if (subscribed[jsonRpc.params?.subscription]) {
                console.log(subscribed[jsonRpc.params.subscription], jsonRpc.params.result);
                switch(subscribed[jsonRpc.params.subscription]) {
                    case 'newPendingTransactions':
                        const tx = Tx.fromRPC(jsonRpc.params.result).toJSON()
                        await Tx.findOneAndUpdate(
                            {_id: tx._id},
                            tx,
                            {
                                upsert: true,
                            }
                        )
                        await new LogNetworkEvent({
                            name: 'tx',
                            data: jsonRpc.params.result
                        }).save();
                        break;
                    case 'newDagBlocks':
                        const dagBlock = DagBlock.fromRPC(jsonRpc.params.result).toJSON();
                        await DagBlock.findOneAndUpdate(
                            {_id: dagBlock._id},
                            dagBlock,
                            {upsert: true}
                        )
                        await new LogNetworkEvent({
                            name: 'dagBlock',
                            data: jsonRpc.params.result
                        }).save();
                        break;
                    case 'newDagBlocksFinalized':
                        const dagBlockFinalized = DagBlock.fromRPC(jsonRpc.params.result).toJSON();
                        await DagBlock.findOneAndUpdate(
                            {_id: dagBlockFinalized._id},
                            dagBlockFinalized,
                            {upsert: true}
                        )
                        await new LogNetworkEvent({
                            name: 'dagBlock',
                            data: jsonRpc.params.result
                        }).save();
                        break;
                    case 'newPbftBlocks':
                        const block = Block.fromRPC(jsonRpc.params.result).toJSON();
                        await Block.findOneAndUpdate(
                            {_id: block._id},
                            block,
                            {upsert: true}
                        )
                        await new LogNetworkEvent({
                            name: 'block',
                            data: jsonRpc.params.result
                        }).save();
                        break;
                    default:
                        console.log('Not persisting data for', subscribed[jsonRpc.params.subscription] )
                        break;
                }
            } else {
                console.log('Ignored message:', jsonRpc);
            }
        } catch (e) {
            console.error(e, o.data);
        }
    });

    ws.on('open', function () {
        topics.forEach((topic) => {
            subscriptionRequests[id.toString(16)] = {topic};
            const request = rpc.request('eth_subscribe', [topic], id);
            ws.send(JSON.stringify(request));
            // console.log('Request', request);
            id ++;
        });
    });

    ws.on('close', function close() {
        console.log('socket disconnected');
        process.exit(1);
    });
}

async function historicalSync() {
    const state = await Promise.all([
        getChainState(),
        getSyncState()
    ]);
    const chainState = state[0];
    let syncState = state[1];
    let verifiedTip = false;

    // console.log('chainState', chainState);
    // console.log('syncState', syncState);

    // if genesis block changes, resync
    if (!chainState.genesis || chainState.genesis !== syncState.genesis) {
        console.log('New genesis block hash. Restarting chain sync.');
        // console.log('chainState', chainState);
        // console.log('syncState', syncState);
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
            // console.log('chainBlockAtSyncNumber', chainBlockAtSyncNumber);
            // console.log('syncState', syncState);
            // console.log('Block hash at height', syncState.number, 'has changed. Re-org detected, walking back.');
            await Promise.all([
                Block.deleteOne({_id: syncState.hash}),
                Tx.deleteMany({blockHash: syncState.hash})
            ]);
            syncState = await getSyncState();
        } else {
            verifiedTip = true;
        }
    }

    // sync to tip
    while (syncState.number < chainState.number) {
        const allBlocks = await Promise.all([
            getBlockByNumber(syncState.number + 1, true),
            getDagBlocksByLevel(syncState.number + 1, false)
        ]);
        const block = allBlocks[0];
        const dagBlocks = allBlocks[1];

        if (block.hash) {
            const started = new Date();
            const bulkTx = [];
            const txHashes = [];

            const notifications = [];

            const minBlock = Object.assign({}, block);

            // SPECIAL CASE GENESIS BLOCK
            if (block.number === '0x0') {
                const fakeTx = new Tx({
                    // _id: '0x0000000000000000000000000000000000000000000000000000000000000000',
                    _id: 'GENESIS',
                    blockHash: block.hash,
                    blockNumber: block.number,
                    to: '0xde2b1203d72d3549ee2f733b00b2789414c7cea5',
                    value: 9007199254740991

                })
                txHashes.push(fakeTx._id);
                bulkTx.push({
                    updateOne: {
                        filter: {_id: fakeTx._id},
                        update: fakeTx.toJSON(),
                        upsert: true
                    }
                });
            }

            for (const tx of block.transactions) {
                txHashes.push(tx.hash);
            }

            minBlock.transactions = txHashes;

            notifications.push({
                insertOne: {
                    document: {
                        log: 'block',
                        data: minBlock
                    }
                }
            });

            for (const tx of block.transactions) {
                tx.timestamp = block.timestamp;
                bulkTx.push({
                    updateOne: {
                        filter: {_id: tx.hash},
                        update: Tx.fromRPC(tx).toJSON(),
                        upsert: true
                    }
                });
                notifications.push({
                    insertOne: {
                        document: {
                            log: 'tx',
                            data: tx
                        }
                    }
                });
            }

            await Tx.bulkWrite(bulkTx, {ordered: true});
            await Block.findOneAndUpdate(
                {_id: block.hash},
                Block.fromRPC(minBlock).toJSON(),
                {
                    upsert: true,
                }
            );

            for (const dagBlockRPC of dagBlocks) {
                const dagBlock =  DagBlock.fromRPC(dagBlockRPC);
                const existingDagBlock = await DagBlock.findOneAndUpdate(
                    {_id: dagBlock._id},
                    dagBlock.toJSON(),
                    {upsert: true}
                );
                if (!existingDagBlock) {
                    notifications.push({
                        insertOne: {
                            document: {
                                log: 'dagBlock',
                                data: dagBlockRPC
                            }
                        }
                    });
                }
            }

            await LogNetworkEvent.bulkWrite(notifications, {ordered: true});

            // update sync state
            syncState.number = parseInt(block.number, 16);
            syncState.genesis = chainState.genesis;
            syncState.hash = block.hash;

            const completed = new Date();
            console.log('Sync\'d block', syncState.number, syncState.hash, 'with', txHashes.length, 'transactions, in', completed - started, 'ms');
        }
    }

    // check for new dag blocks at next level
    const newDagBlocks = await getDagBlocksByLevel(syncState.number + 1, false);
    const notifications = [];
    for (const dagBlockRPC of newDagBlocks) {
        const dagBlock =  DagBlock.fromRPC(dagBlockRPC);
        const existingDagBlock = await DagBlock.findOneAndUpdate(
            {_id: dagBlock._id},
            dagBlock.toJSON(),
            {upsert: true}
        );
        if (!existingDagBlock) {
            notifications.push({
                insertOne: {
                    document: {
                        log: 'dagBlock',
                        data: dagBlockRPC
                    }
                }
            });
        }
    }
    if (notifications.length) {
        console.log(` + ${notifications.length} new dag blocks at level`, syncState.number + 1);
        await LogNetworkEvent.bulkWrite(notifications, {ordered: true});
    }
}

(async () => {
    try {
        await mongoose.connect(config.mongo.uri, config.mongo.options);
        await historicalSync();
        // switch to realtime events from socket
        realtimeSync();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();