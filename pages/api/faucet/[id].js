import config from "config";
import mongoose from "mongoose";
import Web3Utils from "web3-utils";

import Faucet from "../../../models/faucet";

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
    await Faucet.findOneAndUpdate(
      { address },
      { address },
      { upsert: true, new: true }
    );
    res.json({
      status: `Address ${address} is in faucet queue.`,
    });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ error: "Internal error. Please try your request again." });
  }
}
