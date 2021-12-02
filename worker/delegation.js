#!/usr/bin/env node

const config = require('config');
const { Appsignal } = require('@appsignal/nodejs');

const appsignal = new Appsignal(config.appsignal);
const tracer = appsignal.tracer();
const rootSpan = tracer.createSpan({ namespace: 'background' }).setName('delegation-worker');

const BN = require('bn.js');
const Web3 = require('web3');
const RLP = require('rlp');
const { useDb } = require('../lib/db');

const sleep = async (delay = 10 * 1000) => {
  return await new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};

async function worker() {
  tracer.withSpan(tracer.createSpan().setName('worker'), async (span) => {
    const { Delegate } = await useDb();

    const delegates = await Delegate.find({
      status: 'QUEUED',
    }).sort({
      createdAt: 1,
    });
    if (delegates.length === 0) {
      console.log('No delegation requests!');
      span.close();
      return await sleep();
    }

    for (let delegate of delegates) {
      console.log('Processing delegation', delegate);

      tracer.withSpan(tracer.createSpan().setName('delegate'), async (span) => {
        const valueToAdd = new BN(delegate.valueToAdd);
        const valueToSubstract = new BN(delegate.valueToSubstract);

        let status = 'FINISHED';

        if (valueToAdd.gtn(0)) {
          console.log('Delegating to', delegate.node, 'value', valueToAdd.toString());

          try {
            console.log('- own node', delegate.counterpart);
            await delegateTransaction(delegate.counterpart, valueToAdd.mul(new BN(2)));
            console.log('- user node', delegate.node);
            await delegateTransaction(delegate.node, valueToAdd);
          } catch (e) {
            tracer.setError(e);
            console.error(e);
            status = 'ERROR';
          }
        }

        if (valueToSubstract.gtn(0)) {
          console.log('Undelegating from', delegate.node, 'value', valueToSubstract.toString());

          try {
            console.log('- own node', delegate.counterpart);
            await undelegateTransaction(delegate.counterpart, valueToSubstract.mul(new BN(2)));
            console.log('- user node', delegate.node);
            await undelegateTransaction(delegate.node, valueToSubstract);
          } catch (e) {
            tracer.setError(e);
            console.error(e);
            status = 'ERROR';
          }
        }

        await Delegate.findOneAndUpdate(
          { _id: delegate._id },
          {
            valueToAdd: '0',
            valueToSubstract: '0',
            status: status,
          },
        );
        span.close();
        await sleep();
      });
    }
  });
}

async function delegateTransaction(address, value) {
  tracer.withSpan(tracer.createSpan().setName('undelegateTransaction'), async (span) => {
    await sendTransaction(`0x${bufferToHex(RLP.encode([[address, [value, 0]]]))}`);
    span.close();
  });
}

async function undelegateTransaction(address, value) {
  tracer.withSpan(tracer.createSpan().setName('undelegateTransaction'), async (span) => {
    await sendTransaction(`0x${bufferToHex(RLP.encode([[address, [value, 1]]]))}`);
    span.close();
  });
}

async function sendTransaction(input) {
  tracer.withSpan(tracer.createSpan().setName('sendTransaction'), async (span) => {
    const { FaucetNonce } = await useDb();
    const taraxa = new Web3(config.taraxa.node.http);
    const account = taraxa.eth.accounts.privateKeyToAccount(config.faucet.privateKey);
    const faucetNonce = await FaucetNonce.findOneAndUpdate(
      {},
      { $inc: { nonce: 1 } },
      { upsert: true, new: true },
    );
    const tx = await account.signTransaction({
      from: account.address,
      to: '0x00000000000000000000000000000000000000ff',
      value: 0,
      gas: 30000,
      gasPrice: 0,
      nonce: faucetNonce.nonce - 1,
      input,
    });

    await new Promise((resolve, reject) => {
      taraxa.eth
        .sendSignedTransaction(tx.rawTransaction)
        .on('transactionHash', (txHash) => {
          waitForTransaction(taraxa, txHash).then(() => {
            resolve(txHash);
          });
        })
        .on('error', (error) => {
          reject(error);
        });
    });
    span.close();
  });
}

function bufferToHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function waitForTransaction(web3, txnHash, options = null) {
  const interval = options && options.interval ? options.interval : 500;
  const blocksToWait = options && options.blocksToWait ? options.blocksToWait : 1;
  const transactionReceiptAsync = async function (txnHash, resolve, reject) {
    tracer.withSpan(tracer.createSpan().setName('transactionReceiptAsync'), async (span) => {
      try {
        var receipt = web3.eth.getTransactionReceipt(txnHash);
        if (!receipt) {
          span.close();
          setTimeout(function () {
            transactionReceiptAsync(txnHash, resolve, reject);
          }, interval);
        } else {
          if (blocksToWait > 0) {
            var resolvedReceipt = await receipt;
            if (!resolvedReceipt || !resolvedReceipt.blockNumber) {
              span.close();
              setTimeout(function () {
                transactionReceiptAsync(txnHash, resolve, reject);
              }, interval);
            } else {
              try {
                var block = await web3.eth.getBlock(resolvedReceipt.blockNumber);
                var current = await web3.eth.getBlock('latest');
                if (current.number - block.number >= blocksToWait) {
                  var txn = await web3.eth.getTransaction(txnHash);
                  if (txn.blockNumber != null) {
                    span.close();
                    resolve(resolvedReceipt);
                  } else {
                    span.close();
                    reject(
                      new Error(`Transaction with hash: ${txnHash} ended up in an uncle block.`),
                    );
                  }
                } else {
                  span.close();
                  setTimeout(function () {
                    transactionReceiptAsync(txnHash, resolve, reject);
                  }, interval);
                }
              } catch (e) {
                tracer.setError(e);
                span.close();
                setTimeout(function () {
                  transactionReceiptAsync(txnHash, resolve, reject);
                }, interval);
              }
            }
          } else {
            span.close();
            resolve(receipt);
          }
        }
      } catch (e) {
        tracer.setError(e);
        span.close();
        reject(e);
      }
    });
  };

  return new Promise(function (resolve, reject) {
    transactionReceiptAsync(txnHash, resolve, reject);
  });
}

const main = async () => {
  console.log('Delegation worker started');
  while (true) {
    await worker();
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
});
