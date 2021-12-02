import withApiHandler from '../../lib/api-handler';
import { extractBoolean } from '../../lib/query';

async function handler(req, res) {
  const { Tx } = req.models;

  const skip = Number(req.query.skip) || 0;
  const limit = Number(req.query.limit) || 20;
  const reverse = extractBoolean(req.query.reverse, true);
  const { blockHash } = req.query;

  try {
    let filter = {};
    let total;
    if (blockHash) {
      filter = { blockHash };
      total = await Tx.countDocuments(filter);
    } else {
      total = await Tx.estimatedDocumentCount();
    }
    const txs = await Tx.find(filter)
      .limit(limit)
      .skip(skip)
      .sort({ timestamp: reverse ? -1 : 1 });

    res.json({ total, reverse, skip, limit, result: { txs } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error. Please try your request again.' });
  }
}

export default withApiHandler(handler);
