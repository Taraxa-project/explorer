#!/usr/bin/env node

const config = require('config');
const mongoose = require('mongoose');
const Web3 = require('web3-eth');

const Faucet = require('../models/faucet');
const FaucetNonce = require('../models/faucet-nonce');

const taraxa = new Web3(new Web3.providers.HttpProvider(config.taraxa.node.http));
const account = taraxa.accounts.privateKeyToAccount(config.faucet.privateKey);
const dripInterval = config.faucet.dripInterval;

let unconfirmed = 0;

const sleep = async (delay = 3000) => {
  return await new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};

async function drip() {
  const cups = await Faucet.find().sort({ created: -1 });
  if (cups.length === 0) {
    console.log('No addresses in the faucet');
    return await sleep();
  }

  for (let cup of cups) {
    if (unconfirmed >= config.faucet.maxUnconfirmed) {
      console.log('Skipping a round due to unconfirmed count', unconfirmed);
      return await sleep();
    }

    try {
      const faucetNonce = await FaucetNonce.findOneAndUpdate(
        {},
        { $inc: { nonce: 1 } },
        { upsert: true, new: true },
      );

      const tx = await account.signTransaction({
        from: account.address,
        to: cup.address,
        value: 1 * 1e17,
        gas: 21000,
        gasPrice: 1 * 1e9,
        nonce: faucetNonce.nonce - 1,
      });

      await new Promise((resolve, reject) => {
        taraxa
          .sendSignedTransaction(tx.rawTransaction)
          .once('transactionHash', (txHash) => {
            console.log(`Sending tx ${txHash} to ${cup.address}`);
            unconfirmed++;
            resolve(txHash);
          })
          .once('receipt', () => {
            unconfirmed--;
          })
          .once('error', (error) => {
            unconfirmed--;
            console.error(error);
            reject(error);
          });
      });
    } catch (e) {
      console.error(e);
    }

    await sleep(dripInterval);
  }
}

(async () => {
  try {
    await mongoose.connect(config.mongo.uri, config.mongo.options);
    console.log('Faucet started');
    while (true) {
      await drip();
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
