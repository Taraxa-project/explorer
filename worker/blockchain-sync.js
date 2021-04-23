#!/usr/bin/env node

const _ = require("lodash");
const { program } = require("commander");
const pkg = require("../package.json");

const config = require("config");
const mongoose = require("mongoose");

const DagBlock = require("../models/dag_block");
const Block = require("../models/block");
const PBFTBlock = require("../models/pbft_block");
const Tx = require("../models/tx");
const Node = require("../models/node");

const LogNetworkEvent = require("../models/log_network_event");

const { fromEvent } = require("rxjs");
const { mergeMap } = require("rxjs/operators");

const WebSocket = require("ws");

const rpc = require("../lib/rpc");

let taraxaConfig;

let historicalSyncRunning = false;

let chainState = {
  number: 0,
  hash: "",
  genesis: "",
  dagBlockLevel: 0,
  dagBlockPeriod: 0,
};

async function getChainState() {
  const state = await Promise.all([
    rpc.blockNumber(),
    rpc.dagBlockLevel(),
    rpc.dagBlockPeriod(),
  ]);
  const blockNumber = parseInt(state[0], 16);
  const dagBlockLevel = parseInt(state[1], 16);
  const dagBlockPeriod = parseInt(state[2], 16);

  const blocks = await Promise.all([
    rpc.getBlockByNumber(0),
    rpc.getBlockByNumber(blockNumber),
  ]);

  const genesis = blocks[0];
  const block = blocks[1];

  chainState = {
    number: block.number,
    hash: block.hash,
    genesis: genesis.hash,
    dagBlockLevel,
    dagBlockPeriod,
  };

  return chainState;
}

async function getSyncState() {
  const blocks = await Promise.all([
    Block.find({ number: 0 }),
    Block.find().sort({ number: -1 }).limit(1),
    DagBlock.find().sort({ level: -1 }).limit(1),
    DagBlock.find().sort({ period: -1 }).limit(1),
  ]);
  const genesisBlocks = blocks[0];
  const lastBlocks = blocks[1];
  const lastDagBlocksByLevel = blocks[2];
  const lastDagBlocksByPeriod = blocks[3];

  const syncState = {
    hash: "",
    genesis: "",
    number: -1,
    dagBlockLevel: 0,
    dagBlockPeriod: -1,
  };

  if (lastBlocks[0]) {
    syncState.number = lastBlocks[0].number;
  }

  if (genesisBlocks.length) {
    syncState.genesis = genesisBlocks[0]._id;
  }

  if (lastBlocks.length) {
    syncState.hash = lastBlocks[0]._id;
  }

  if (lastDagBlocksByLevel.length) {
    syncState.dagBlockLevel = lastDagBlocksByLevel[0].level;
  }

  if (lastDagBlocksByPeriod.length) {
    syncState.dagBlockPeriod = lastDagBlocksByPeriod[0].period;
  }

  return syncState;
}

async function dropChainData() {
  await Promise.all([
    DagBlock.deleteMany(),
    Block.deleteMany(),
    Tx.deleteMany(),
    Node.deleteMany(),
  ]);
}

function formatPbftBlock(pbftBlock) {
  // todo: rpc currently incorrectly returns hex without the 0x prefix
  const dagPeriodBlocks = pbftBlock.schedule.dag_blocks_order;
  if (!dagPeriodBlocks[0].startsWith("0x")) {
    dagPeriodBlocks.forEach((dagPeriodBlock, index) => {
      pbftBlock.schedule.dag_blocks_order[index] = `0x${dagPeriodBlock}`;
    });
  }

  // todo: rpc currently incorrectly returns integer, but it should return hex
  let dagPeriod = pbftBlock.period;
  if (typeof dagPeriod === "string") {
    pbftBlock.period = parseInt(dagPeriod, 16);
  }

  pbftBlock._id = pbftBlock.block_hash;
  delete pbftBlock.block_hash;

  return pbftBlock;
}

async function realtimeSync() {
  const topics = [
    "newDagBlocks",
    "newDagBlocksFinalized",
    "newPbftBlocks",
    "newHeads",
  ];
  let id = 0;
  let subscriptionRequests = [];
  let subscribed = {};
  const ws = new WebSocket(config.taraxa.node.ws);
  const blockchainEvent$ = fromEvent(ws, "message");
  const blockchainError$ = fromEvent(ws, "error");

  blockchainError$.subscribe((error) => {
    console.error(error);
  });

  blockchainEvent$
    .pipe(
      mergeMap(async (o) => {
        try {
          const jsonRpc = JSON.parse(o.data);
          // handle subscription request responses
          if (subscriptionRequests[jsonRpc.id]) {
            console.log(
              `Subscribed to ${subscriptionRequests[jsonRpc.id].topic}`
            );
            subscribed[jsonRpc.result] = subscriptionRequests[jsonRpc.id].topic;
            // handle subscription data
          } else if (subscribed[jsonRpc.params?.subscription]) {
            console.log(
              subscribed[jsonRpc.params.subscription],
              JSON.stringify(jsonRpc.params.result, null, 2)
            );
            switch (subscribed[jsonRpc.params.subscription]) {
              case "newDagBlocks":
                const dagBlock = DagBlock.fromRPC(
                  jsonRpc.params.result
                ).toJSON();
                await DagBlock.findOneAndUpdate(
                  { _id: dagBlock._id },
                  dagBlock,
                  { upsert: true }
                );
                await new LogNetworkEvent({
                  log: "dag-block",
                  data: dagBlock,
                }).save();
                return dagBlock;
              case "newDagBlocksFinalized":
                // console.log(subscribed[jsonRpc.params.subscription], JSON.stringify(jsonRpc.params.result, null, 2));
                const dagBlockFinalized = await DagBlock.findOneAndUpdate(
                  { _id: jsonRpc.params.result.block },
                  { period: jsonRpc.params.result.period },
                  { upsert: false, new: true }
                );
                await new LogNetworkEvent({
                  log: "dag-block-finalized",
                  data: {
                    block: dagBlockFinalized._id,
                    period: dagBlockFinalized.period,
                  },
                }).save();

                return dagBlockFinalized;
              case "newPbftBlocks":
                // console.log(subscribed[jsonRpc.params.subscription], JSON.stringify(jsonRpc.params.result, null, 2));
                const pbftBlock = formatPbftBlock(
                  jsonRpc.params.result.pbft_block
                );
                await PBFTBlock.findOneAndUpdate(
                  { _id: pbftBlock._id },
                  pbftBlock,
                  { new: true, upsert: true }
                );
                await DagBlock.updateMany(
                  { _id: { $in: pbftBlock.schedule.dag_blocks_order } },
                  { $set: { period: pbftBlock.period } }
                );
                await new LogNetworkEvent({
                  log: "pbft-block",
                  data: formatPbftBlock(jsonRpc.params.result.pbft_block),
                }).save();
                return;
              case "newHeads":
                // console.log(subscribed[jsonRpc.params.subscription], JSON.stringify(jsonRpc.params.result, null, 2));
                const blockNumber = parseInt(jsonRpc.params.result.number, 16);
                chainState.number = blockNumber;
                chainState.hash = jsonRpc.params.result.hash;
                await historicalSync(true);
                return;
              default:
                console.log(
                  "Not persisting data for",
                  subscribed[jsonRpc.params.subscription],
                  jsonRpc.params.result
                );
                return;
            }
          } else {
            console.log("Ignored message:", jsonRpc);
          }
        } catch (e) {
          console.error("Error", e, o.data);
        }
      })
    )
    .subscribe(async function (o) {
      // console.log(o)
    });

  ws.on("open", function () {
    topics.forEach((topic) => {
      subscriptionRequests[id.toString(16)] = { topic };
      const request = rpc.request("eth_subscribe", [topic], id);
      ws.send(JSON.stringify(request));
      // console.log('Request', request);
      id++;
    });
  });

  ws.on("close", function close() {
    console.log("socket disconnected");
    process.exit(1);
  });
}

async function getTransactionReceipts(hashes, limit) {
  const _hashes = Object.assign([], _.zip(hashes, _.range(hashes.length)));
  const results = [];

  const awaitWorker = async () => {
    while (_hashes.length > 0) {
      const [hash, idx] = _hashes.pop();
      results[idx] = await rpc.getTransactionReceipt(hash);
    }
  };

  await Promise.all(_.range(limit).map(awaitWorker));
  return results;
}

async function historicalSync(subscribed = false) {
  if (historicalSyncRunning) {
    return;
  }
  historicalSyncRunning = true;
  const state = await Promise.all([
    getChainState(), // updates global var
    getSyncState(),
  ]);

  let syncState = state[1];
  let verifiedTip = false;

  // console.log('chainState', chainState);
  // console.log('syncState', syncState);

  // if genesis block changes, resync
  if (!chainState.genesis || chainState.genesis !== syncState.genesis) {
    console.log("New genesis block hash. Restarting chain sync.");
    // console.log('chainState', chainState);
    // console.log('syncState', syncState);
    await dropChainData();
    syncState = {
      number: -1,
      hash: "",
      genesis: "",
      dagBlockLevel: 0,
      dagBlockPeriod: -1,
    };
    verifiedTip = true;
  }

  while (!verifiedTip) {
    const chainBlockAtSyncNumber = await rpc.getBlockByNumber(syncState.number);
    if (chainBlockAtSyncNumber.hash !== syncState.hash) {
      console.log(
        "Block hash at height",
        syncState.number,
        "has changed. Re-org detected, walking back."
      );
      const lastBlock = await Block.findOne({ _id: syncState.hash });
      // go back a step
      syncState.number = Number(lastBlock.number) - 1;
      syncState.hash = lastBlock.parentHash;
    } else {
      verifiedTip = true;
    }
  }

  // sync blocks to tip
  while (syncState.number < chainState.number) {
    const notifications = [];

    const block = await rpc.getBlockByNumber(syncState.number + 1, true);

    if (!block.hash) {
      continue;
    }

    const started = new Date();
    const bulkTx = [];
    const txHashes = [];
    let blockReward = 0;

    const minBlock = Object.assign({}, block);
    let scheduleBlock = {
      schedule: {
        dag_blocks_order: [],
      },
    };

    // SPECIAL CASE GENESIS BLOCK
    if (block.number === "0x0") {
      let genesis =
        taraxaConfig?.chain_config?.final_chain?.state?.genesis_balances || {};
      Object.keys(genesis).forEach((address, index) => {
        const fakeTx = new Tx({
          // _id: '0x0000000000000000000000000000000000000000000000000000000000000000',
          _id: "GENESIS_" + index,
          blockHash: block.hash,
          blockNumber: block.number,
          to: `0x${address}`,
          value: genesis[address],
          timestamp: new Date(0x5d422b80 * 1000),

          status: true,
          gasUsed: 0,
          cumulativeGasUsed: 0,
        });
        txHashes.push(fakeTx._id);
        bulkTx.push({
          updateOne: {
            filter: { _id: fakeTx._id },
            update: fakeTx.toJSON(),
            upsert: true,
          },
        });
      });
    } else {
      if (!subscribed) {
        // no need to do this if already getting dag blocks over websocket
        const scheduleBlockRPC = await rpc.getScheduleBlockByPeriod(
          block.number
        );
        scheduleBlock = formatPbftBlock(scheduleBlockRPC);
        const getDagPromises = [];
        for (const dagBlockHash of scheduleBlock.schedule.dag_blocks_order) {
          getDagPromises.push(rpc.getDagBlockByHash(dagBlockHash));
        }
        const dagBlocks = await Promise.all(getDagPromises);
        for (const dagBlockRPC of dagBlocks) {
          const dagBlock = DagBlock.fromRPC(dagBlockRPC);
          const d = dagBlock.toJSON();
          const existingDagBlock = await DagBlock.findOneAndUpdate(
            { _id: dagBlock._id },
            d,
            { upsert: true }
          );
          if (!existingDagBlock) {
            notifications.push({
              insertOne: {
                document: {
                  log: "dag-block",
                  data: d,
                },
              },
            });
          }

          syncState.dagBlockLevel = dagBlock.level - 1;
        }
        if (dagBlocks.length) {
          // send for last dag block in schedule
          const dagBlockRPC = dagBlocks[dagBlocks.length - 1];
          const dagBlock = DagBlock.fromRPC(dagBlockRPC);
          notifications.push({
            insertOne: {
              document: {
                log: "dag-block-finalized",
                data: {
                  block: dagBlock._id,
                  period: dagBlock.period,
                },
              },
            },
          });
        }
        await PBFTBlock.findOneAndUpdate(
          { _id: scheduleBlock._id },
          scheduleBlock,
          { new: true, upsert: true }
        );
        notifications.push({
          insertOne: {
            document: {
              log: "pbft-block",
              data: scheduleBlock,
            },
          },
        });

        syncState.dagBlockPeriod = block.number;
      }
    }

    const txReceipts = await getTransactionReceipts(
      block.transactions.map((tx) => tx.hash),
      20
    );

    block.transactions.forEach((tx, idx) => {
      txHashes.push(tx.hash);
      const receipt = txReceipts[idx];
      blockReward = blockReward + Number(receipt.gasUsed) * Number(tx.gasPrice);
    });

    minBlock.reward = blockReward;
    minBlock.transactions = txHashes;

    notifications.push({
      insertOne: {
        document: {
          log: "block",
          data: Block.fromRPC(minBlock).toJSON(),
        },
      },
    });

    block.transactions.forEach((tx, idx) => {
      const receipt = txReceipts[idx];
      tx.timestamp = block.timestamp;

      const t = Tx.fromRPC(tx).toJSON();
      t.status = receipt.status === "0" ? false : true;
      t.gasUsed = parseInt(receipt.gasUsed, 16);
      t.cumulativeGasUsed = parseInt(receipt.cumulativeGasUsed, 16);
      t.contractAddress =
        receipt.contractAddress === "0x0000000000000000000000000000000000000000"
          ? undefined
          : receipt.contractAddress;

      bulkTx.push({
        updateOne: {
          filter: { _id: tx.hash },
          update: t,
          upsert: true,
        },
      });
    });

    await Tx.bulkWrite(bulkTx, { ordered: true });
    await Block.findOneAndUpdate(
      { _id: block.hash },
      Block.fromRPC(minBlock).toJSON(),
      {
        upsert: true,
      }
    );

    await Node.findOneAndUpdate(
      { _id: block.miner },
      { $inc: { blocks: 1 } },
      { upsert: true, new: true }
    );

    await LogNetworkEvent.bulkWrite(notifications, { ordered: true });

    // update sync state
    syncState.number = parseInt(block.number, 16);
    syncState.genesis = chainState.genesis;
    syncState.hash = block.hash;

    const completed = new Date();
    console.log(
      "Sync'd block",
      syncState.number,
      syncState.hash,
      "with",
      txHashes.length,
      "transactions, in",
      completed - started,
      "ms"
    );
  }

  // sync unfinalized dag blocks to tip
  if (!subscribed) {
    // no need to do this if already getting dag blocks over websocket
    while (syncState.dagBlockLevel < chainState.dagBlockLevel) {
      console.log(
        "DAG sync:",
        syncState.dagBlockLevel + 1,
        "of",
        chainState.dagBlockLevel
      );
      const notifications = [];

      const dagBlocks = await rpc.getDagBlocksByLevel(
        syncState.dagBlockLevel + 1,
        false
      );

      for (const dagBlockRPC of dagBlocks) {
        const dagBlock = DagBlock.fromRPC(dagBlockRPC);
        const d = dagBlock.toJSON();
        const existingDagBlock = await DagBlock.findOneAndUpdate(
          { _id: dagBlock._id },
          d,
          { upsert: true }
        );
        if (!existingDagBlock) {
          notifications.push({
            insertOne: {
              document: {
                log: "dag-block",
                data: d,
              },
            },
          });
        }

        syncState.dagBlockLevel = dagBlock.level;
      }

      if (notifications.length) {
        await LogNetworkEvent.bulkWrite(notifications, { ordered: true });
      }
    }
  }

  historicalSyncRunning = false;
}

program.version(pkg.version);
program.option("-c, --config <string>", "path to taraxa config file");
program.action(async function (cmdObj) {
  try {
    if (!cmdObj.config) {
      throw new Error("path to config file not specified. Please use --config");
    }

    try {
      taraxaConfig = require(cmdObj.config);
    } catch (e) {
      throw new Error("Could not open config file: " + cmdObj.config);
    }

    await mongoose.connect(config.mongo.uri, config.mongo.options);
    await historicalSync();
    // switch to realtime events from socket
    realtimeSync();
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
});
program.parse(process.argv);
