import config from "config";
import mongoose from "mongoose";
import BN from "bn.js";
import Web3Utils from "web3-utils";
import * as ethUtil from "ethereumjs-util";

import * as fs from "fs";

const Delegate = require("../models/delegate");


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

  let valueToAdd = ELIGIBILITY_THRESHOLD;

  let delegate = await Delegate.findOne({ _id: address });
  if (delegate) {
    const delegateValueToAdd = new BN(delegate.valueToAdd);
    valueToAdd = delegateValueToAdd.add(valueToAdd);

    await Delegate.findOneAndUpdate(
      { _id: address },
      {
        valueToAdd,
        status: "QUEUED",
      },
      { upsert: true }
    );

    return;
  }

  delegate = await Delegate.create({
    _id: address,
    counterpart: getOwnNode(),
    valueToAdd,
    valueToSubstract: "0",
    total: "0",
    status: "QUEUED",
  });
  await delegate.save();
}

export async function undelegateFrom(address) {
  connectToDb();

  const delegate = await Delegate.findOne({ _id: address });
  if (!delegate) {
    throw new Error("This node was not found.");
  }

  const delegateValueToSubstract = new BN(delegate.valueToSubstract);
  let valueToSubstract = delegateValueToSubstract.add(ELIGIBILITY_THRESHOLD);

  await Delegate.findOneAndUpdate(
    { _id: address },
    {
      valueToSubstract,
      status: "QUEUED",
    },
    { upsert: true }
  );
}

function connectToDb() {
  mongoose.connection._readyState ||
    mongoose.connect(config.mongo.uri, config.mongo.options);
}

function getOwnNode() {
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
