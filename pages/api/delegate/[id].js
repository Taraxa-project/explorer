import withApiHandler from '../../../lib/api-handler';
import { verifyAddress, delegateTo } from '../../../lib/delegation';

async function handler(req, res) {
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
    await delegateTo(address);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error. Please try your request again.' });
    return;
  }

  res.json({
    status: `Successfully delegated to ${address}.`,
  });
}

export default withApiHandler(handler);
