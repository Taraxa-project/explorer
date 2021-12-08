import withApiHandler from '../../../lib/api-handler';
import { getPopulatedAddress, getTransactions } from '../../../lib/address';
import { extractBoolean } from '../../../lib/query';

async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  const skip = Number(req.query.skip) || 0;
  const limit = Number(req.query.limit) || 20;
  const sortOrder = extractBoolean(req.query.reverse, true) ? -1 : 1;
  const query = { id, skip, limit, sortOrder };

  switch (method) {
    case 'GET':
      try {
        const addressResult = await getPopulatedAddress(id);
        const txResult = await getTransactions(query);
        const address = JSON.parse(JSON.stringify(addressResult));
        const tx = JSON.parse(JSON.stringify(txResult));
        return res.json({ address, tx });
      } catch (e) {
        res.status(e.status).json({ error: e.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default withApiHandler(handler);
