import config from "config";
import mongoose from "mongoose";
import BN from "bn.js";
import Web3 from "web3-eth";
import Web3Utils from "web3-utils";
import * as ethUtil from "ethereumjs-util";
import * as RLP from "rlp";

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

export async function delegateTo(address) {
  connectToDb();

  const input = `0x${bufferToHex(
    RLP.encode([[address, [ELIGIBILITY_THRESHOLD, 0]]])
  )}`;
  await sendTransaction(input);

  const delegate = await Delegate.findOne({ _id: address });

  let value = ELIGIBILITY_THRESHOLD;
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
export async function undelegateFrom(address) {
  connectToDb();

  const input = `0x${bufferToHex(
    RLP.encode([[address, [ELIGIBILITY_THRESHOLD, 1]]])
  )}`;
  await sendTransaction(input);

  const delegate = await Delegate.findOne({ _id: address });

  let value = ELIGIBILITY_THRESHOLD;
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
  const taraxa = new Web3(
    new Web3.providers.HttpProvider(config.taraxa.node.http)
  );
  const account = taraxa.accounts.privateKeyToAccount(config.faucet.privateKey);
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
    taraxa
      .sendSignedTransaction(tx.rawTransaction)
      .on("transactionHash", (txHash) => {
        resolve(txHash);
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
