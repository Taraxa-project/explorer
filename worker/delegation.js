#!/usr/bin/env node

const config = require('config');
const BN = require('bn.js');
const Web3 = require('web3');
const RLP = require('rlp');
const { useDb } = require('../lib/db');

const sleep = async (delay = 30 * 1000) => {
  return await new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};

async function worker() {
  const { Delegate } = await useDb();

  const delegates = await Delegate.find({
    status: 'QUEUED',
  }).sort({
    updatedAt: 1,
  });
  if (delegates.length === 0) {
    console.log('No delegation requests!');
    return await sleep();
  }

  for (let delegate of delegates) {
    console.log('Processing delegation', delegate);

    const valueToAdd = new BN(delegate.valueToAdd);
    const valueToSubstract = new BN(delegate.valueToSubstract);
    let total = new BN(delegate.total);
    let status = 'FINISHED';

    if (valueToAdd.gtn(0)) {
      console.log('Delegating to', delegate._id, 'value', valueToAdd.toString());

      try {
        await delegateTransaction(delegate.counterpart, valueToAdd.mul(new BN(2)));
        console.log('- own node', delegate.counterpart);
        await delegateTransaction(delegate._id, valueToAdd);
        console.log('- user node', delegate._id);
      } catch (e) {
        console.error(e);
        status = 'ERROR';
      }

      total = total.add(valueToAdd);
    }

    if (valueToSubstract.gtn(0)) {
      console.log('Undelegating from', delegate._id, 'value', valueToSubstract.toString());

      try {
        await undelegateTransaction(delegate.counterpart, valueToSubstract.mul(new BN(2)));
        console.log('- own node', delegate.counterpart);
        await undelegateTransaction(delegate._id, valueToSubstract);
        console.log('- user node', delegate._id);
      } catch (e) {
        console.error(e);
        status = 'ERROR';
      }

      total = total.sub(valueToSubstract);
    }

    await Delegate.findOneAndUpdate(
      { _id: delegate._id },
      {
        valueToAdd: '0',
        valueToSubstract: '0',
        total: total.toString(),
        status: status,
      },
    );

    await sleep();
  }
}

async function delegateTransaction(address, value) {
  await sendTransaction(`0x${bufferToHex(RLP.encode([[address, [value, 0]]]))}`);
}

async function undelegateTransaction(address, value) {
  await sendTransaction(`0x${bufferToHex(RLP.encode([[address, [value, 1]]]))}`);
}

async function sendTransaction(input) {
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
}

function bufferToHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function waitForTransaction(web3, txnHash, options = null) {
  const interval = options && options.interval ? options.interval : 500;
  const blocksToWait = options && options.blocksToWait ? options.blocksToWait : 1;
  const transactionReceiptAsync = async function (txnHash, resolve, reject) {
    try {
      var receipt = web3.eth.getTransactionReceipt(txnHash);
      if (!receipt) {
        setTimeout(function () {
          transactionReceiptAsync(txnHash, resolve, reject);
        }, interval);
      } else {
        if (blocksToWait > 0) {
          var resolvedReceipt = await receipt;
          if (!resolvedReceipt || !resolvedReceipt.blockNumber) {
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
                  resolve(resolvedReceipt);
                } else {
                  reject(
                    new Error(`Transaction with hash: ${txnHash} ended up in an uncle block.`),
                  );
                }
              } else {
                setTimeout(function () {
                  transactionReceiptAsync(txnHash, resolve, reject);
                }, interval);
              }
            } catch (e) {
              setTimeout(function () {
                transactionReceiptAsync(txnHash, resolve, reject);
              }, interval);
            }
          }
        } else {
          resolve(receipt);
        }
      }
    } catch (e) {
      reject(e);
    }
  };

  return new Promise(function (resolve, reject) {
    transactionReceiptAsync(txnHash, resolve, reject);
  });
}

(async () => {
  try {
    console.log('Delegation worker started');
    while (true) {
      await worker();
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
