import withApiHandler from '../../../lib/api-handler';

async function handler(req, res) {
  const { Block } = req.models;

  const {
    query: { id },
    method,
  } = req;

  let fullTransactions = Boolean(req.query.fullTransactions);

  switch (method) {
    case 'GET':
      try {
        let block;
        if (fullTransactions) {
          block = await Block.findOne({ _id: id }).populate('transactions');
        } else {
          block = await Block.findOne({ _id: id });
        }

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
