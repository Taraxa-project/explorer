import config from "config";
import mongoose from "mongoose";
import BN from "bn.js";
import Web3 from "web3";
import Web3Utils from "web3-utils";
import * as ethUtil from "ethereumjs-util";
import * as RLP from "rlp";
import * as fs from "fs";

const Delegate = require("../models/delegate");
const FaucetNonce = require("../models/faucet-nonce");

const ELIGIBILITY_THRESHOLD = new BN("1000000");

export function verifyAddress(id, sig) {
  let address = id;

  if (typeof address !== "string") {
    address = address.toString();
  }
  address = address.trim();

  if (!Web3Utils.isAddress(address)) {
    throw new Error("Wallet Address is not valid.");
  }

  try {
    const { v, r, s } = ethUtil.fromRpcSig(sig);
    const sigAddress = ethUtil.bufferToHex(
      ethUtil.pubToAddress(
        ethUtil.ecrecover(ethUtil.keccak256(address), v, r, s)
      )
    );
    if (sigAddress !== config.delegate.trustedAddress) {
      throw new Error("Signature is not valid.");
    }
  } catch (e) {
    throw new Error("Signature is not valid.");
  }

  return address;
}

export function getOwnNode() {
  let taraxaConfig;

  try {
    taraxaConfig = JSON.parse(fs.readFileSync(config.nodeConfigPath, "utf8"));
  } catch (e) {
    throw new Error(
      "Could not open node config file: " + config.nodeConfigPath
    );
  }

  const genesisState =
    taraxaConfig?.final_chain?.state?.dpos?.genesis_state || {};
  const keys = Object.keys(genesisState);

  if (keys.length < 1) {
    return [];
  }

  const nodes = Object.keys(genesisState[keys[0]]);
  const randomIndex = Math.floor(Math.random() * nodes.length);

  return nodes[randomIndex];
}

export async function delegateTo(address, ownNode = false) {
  connectToDb();

  let threshold = ELIGIBILITY_THRESHOLD;
  if (ownNode) {
    threshold = threshold.mul(new BN(2));
  }

  const input = `0x${bufferToHex(RLP.encode([[address, [threshold, 0]]]))}`;
  await sendTransaction(input);

  const delegate = await Delegate.findOne({ _id: address });

  let value = threshold;
  if (delegate) {
    let delegateValue = new BN(delegate.value);
    value = delegateValue.add(value);
  }

  await Delegate.findOneAndUpdate(
    { _id: address },
    {
      value,
      _id: address,
      created: new Date(),
    },
    { upsert: true, new: true }
  );
}

export async function undelegateFrom(address, ownNode = false) {
  connectToDb();

  let threshold = ELIGIBILITY_THRESHOLD;
  if (ownNode) {
    threshold = threshold.mul(new BN(2));
  }

  const input = `0x${bufferToHex(RLP.encode([[address, [threshold, 1]]]))}`;
  await sendTransaction(input);

  const delegate = await Delegate.findOne({ _id: address });

  let value = threshold;
  if (delegate) {
    let delegateValue = new BN(delegate.value);
    value = delegateValue.sub(value);
  }

  await Delegate.findOneAndUpdate(
    { _id: address },
    {
      value,
      _id: address,
      created: new Date(),
    },
    { upsert: true, new: true }
  );
}

function connectToDb() {
  mongoose.connection._readyState ||
    mongoose.connect(config.mongo.uri, config.mongo.options);
}

async function sendTransaction(input) {
  const taraxa = new Web3(config.taraxa.node.http);
  const account = taraxa.eth.accounts.privateKeyToAccount(
    config.faucet.privateKey
  );
  const faucetNonce = await FaucetNonce.findOneAndUpdate(
    {},
    { $inc: { nonce: 1 } },
    { upsert: true, new: true }
  );
  const tx = await account.signTransaction({
    from: account.address,
    to: "0x00000000000000000000000000000000000000ff",
    value: 0,
    gas: 30000,
    gasPrice: 0,
    nonce: faucetNonce.nonce - 1,
    input,
  });

  await new Promise((resolve, reject) => {
    taraxa.eth
      .sendSignedTransaction(tx.rawTransaction)
      .on("transactionHash", (txHash) => {
        waitForTransaction(taraxa, txHash).then((receipt) => {
          resolve(txHash);
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

function bufferToHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function waitForTransaction(web3, txnHash, options = null) {
  const interval = options && options.interval ? options.interval : 500;
  const blocksToWait =
    options && options.blocksToWait ? options.blocksToWait : 1;
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
              var current = await web3.eth.getBlock("latest");
              if (current.number - block.number >= blocksToWait) {
                var txn = await web3.eth.getTransaction(txnHash);
                if (txn.blockNumber != null) resolve(resolvedReceipt);
                else
                  reject(
                    new Error(
                      "Transaction with hash: " +
                        txnHash +
                        " ended up in an uncle block."
                    )
                  );
              } else
                setTimeout(function () {
                  transactionReceiptAsync(txnHash, resolve, reject);
                }, interval);
            } catch (e) {
              setTimeout(function () {
                transactionReceiptAsync(txnHash, resolve, reject);
              }, interval);
            }
          }
        } else resolve(receipt);
      }
    } catch (e) {
      reject(e);
    }
  };

  return new Promise(function (resolve, reject) {
    transactionReceiptAsync(txnHash, resolve, reject);
  });
}
