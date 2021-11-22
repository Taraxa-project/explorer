import withApiHandler from '../../../lib/api-handler';

async function handler(req, res) {
  const {
    models: { Tx },
    query: { id },
    method,
  } = req;

  switch (method) {
    case 'GET':
      try {
        const tx = await Tx.findOne({ _id: id });
        if (tx) {
          return res.json(tx);
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
