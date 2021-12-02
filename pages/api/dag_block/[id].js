import withApiHandler from '../../../lib/api-handler';
import { extractBoolean } from '../../../lib/query';

async function handler(req, res) {
  const {
    models: { Block },
    query: { id },
    method,
  } = req;

  const fullTransactions = extractBoolean(req.query.fullTransactions, false);

  switch (method) {
    case 'GET':
      try {
        let blockQuery = Block.findOne({ _id: id });
        if (fullTransactions) {
          blockQuery = blockQuery.populate('transactions');
        }

        const block = await blockQuery;
        if (block) {
          return res.json(block);
        }
        return res.status(404).json({ error: 'Not found' });
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal error. Please try your request again.' });
      }
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default withApiHandler(handler);
