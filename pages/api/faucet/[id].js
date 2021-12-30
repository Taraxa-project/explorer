const config = require('config');
import Web3Utils from 'web3-utils';
import withApiHandler from '../../../lib/api-handler';

async function handler(req, res) {
  const {
    models: { Faucet },
    query: { id },
  } = req;

  if (!config.faucet.enabled) {
    res.status(400).json({ error: 'Faucet is disabled for this network.' });
  }

  let address = id;
  if (typeof id !== 'string') {
    address = address.toString();
  }
  address = address.trim();

  if (!Web3Utils.isAddress(address)) {
    res.status(400).json({ error: 'Wallet Address is not valid' });
  }

  try {
    await Faucet.findOneAndUpdate({ address }, { address }, { upsert: true, new: true });
    res.json({
      status: `Address ${address} is in faucet queue.`,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error. Please try your request again.' });
  }
}

export default withApiHandler(handler);
