import Web3Utils from "web3-utils";
import { undelegateFrom } from "../../../lib/delegation";

export default async function undelegateHandler(req, res) {
  const {
    query: { id },
  } = req;

  let address = id;

  if (typeof address !== "string") {
    address = address.toString();
  }
  address = address.trim();

  if (!Web3Utils.isAddress(address)) {
    res.status(400).json({ error: "Wallet Address is not valid." });
    return;
  }

  try {
    await undelegateFrom(address);
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ error: "Internal error. Please try your request again." });
    return;
  }

  res.json({
    status: `Successfully undelegated from ${address}.`,
  });
}
