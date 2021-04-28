import { verifyAddress, undelegateFrom } from "../../../lib/delegation";

export default async function undelegateHandler(req, res) {
  const {
    query: { id, sig },
  } = req;

  let address;
  try {
    address = verifyAddress(id, sig);
  } catch (e) {
    res.status(400).json({ error: e.message });
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
