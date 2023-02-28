#!/usr/bin/env node

const config = require('config');
const Web3 = require('web3-eth');
const { useDb } = require('../lib/db');
const { sleep } = require('../lib/timing');

const taraxa = new Web3(new Web3.providers.HttpProvider(config.taraxa.node.http));
const account = taraxa.accounts.privateKeyToAccount(config.faucet.privateKey);
const dripInterval = config.faucet.dripInterval;

const SLEEP_SECONDS = 3;

let unconfirmed = 0;

async function drip() {
  const { Faucet, FaucetNonce } = await useDb();
  const cups = await Faucet.find().sort({ created: -1 });
  if (cups.length === 0) {
    console.log('No addresses in the faucet');
    return await sleep(SLEEP_SECONDS);
  }

  for (let cup of cups) {
    if (unconfirmed >= config.faucet.maxUnconfirmed) {
      console.log('Skipping a round due to unconfirmed count', unconfirmed);
      return await sleep(SLEEP_SECONDS);
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
        value: 1,
        gas: 21000,
        gasPrice: 1,
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

    await sleep(dripInterval / 1000);
  }
}

const main = async () => {
  console.log('Faucet started');
  while (true) {
    await drip();
  }
};

(async () => {
  try {
    await main();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
