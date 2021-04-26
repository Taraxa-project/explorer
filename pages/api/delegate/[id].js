import config from "config";
import mongoose from "mongoose";
import BN from "bn.js";
import Web3 from "web3-eth";
import Web3Utils from "web3-utils";
import * as RLP from "rlp";

const Delegate = require("../../../models/delegate");
const FaucetNonce = require("../../../models/faucet-nonce");

const ELIGIBILITY_THRESHOLD = new BN("999999999999999983222785");

const bufferToHex = (buffer) => {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export default async function userHandler(req, res) {
  try {
    mongoose.connection._readyState ||
      (await mongoose.connect(config.mongo.uri, config.mongo.options));
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: "Internal error. Please try your request again." });
  }

  const {
    query: { id },
  } = req;

  let address = id;
  if (typeof id !== "string") {
    address = address.toString();
  }
  address = address.trim();

  if (!Web3Utils.isAddress(address)) {
    res.status(400).json({ error: "Wallet Address is not valid" });
  }

  try {
    await Delegate.findOneAndUpdate(
      { address },
      { address, value: 0, created: new Date() },
      { upsert: true, new: true }
    );
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ error: "Internal error. Please try your request again." });
  }

  const input = `0x${bufferToHex(
    RLP.encode([[address, [ELIGIBILITY_THRESHOLD, 0]]])
  )}`;

  const taraxa = new Web3(
    new Web3.providers.HttpProvider(config.taraxa.node.http)
  );
  const account = taraxa.accounts.privateKeyToAccount(config.faucet.privateKey);
  const faucetNonce = await FaucetNonce.findOneAndUpdate(
    {},
    { $inc: { nonce: 1 } },
    { upsert: true, new: true }
  );
  const unsignedTx = {
    from: account.address,
    to: "0x00000000000000000000000000000000000000ff",
    value: 0,
    gas: 30000,
    gasPrice: 0,
    nonce: faucetNonce.nonce - 1,
    input,
  };
  const tx = await account.signTransaction(unsignedTx);

  try {
    await new Promise((resolve, reject) => {
      taraxa
        .sendSignedTransaction(tx.rawTransaction)
        .on("transactionHash", (txHash) => {
          resolve(txHash);
        })
        .on("error", (error) => {
          console.error(error);
          reject(error);
        });
    });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ error: "Internal error. Please try your request again." });
  }

  try {
    await Delegate.findOneAndUpdate(
      { address },
      { address, value: ELIGIBILITY_THRESHOLD.toString() },
      { upsert: true, new: true }
    );
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ error: "Internal error. Please try your request again." });
  }

  res.json({
    status: `Successfully delegated to ${address}.`,
  });
}
