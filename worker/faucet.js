#!/usr/bin/env node

const config = require('config');
const { Appsignal } = require('@appsignal/nodejs');

const appsignal = new Appsignal(config.appsignal);
const tracer = appsignal.tracer();
const rootSpan = tracer.createSpan({ namespace: 'background' }).setName('faucet-worker');

const Web3 = require('web3-eth');
const { useDb } = require('../lib/db');

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
  const { Faucet, FaucetNonce } = await useDb();
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

    tracer.withSpan(tracer.createSpan().setName('cup'), async (span) => {
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
        tracer.setError(e);
        console.error(e);
      }
      span.close();
    });

    await sleep(dripInterval);
  }
}

const main = async () => {
  console.log('Faucet started');
  while (true) {
    await drip();
  }
};

tracer.withSpan(rootSpan, async (span) => {
  try {
    await main();
  } catch (e) {
    console.error(e);
    tracer.setError(e);
    span.close();
    appsignal.stop();
    process.exit(1);
  }

  span.close();
  appsignal.stop();
});
