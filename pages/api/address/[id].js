import withApiHandler from '../../../lib/api-handler';
import { getAddress } from '../../../lib/address';

async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  let skip = Number(req.query.skip) || 0;
  let limit = Number(req.query.limit) || 20;
  let sortOrder = req.query.reverse ? 1 : -1;

  let query = { id, skip, limit, sortOrder };

  switch (method) {
    case 'GET':
      try {
        const address = await getAddress(query);
        return res.json(address);
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
