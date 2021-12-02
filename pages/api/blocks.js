import withApiHandler from '../../lib/api-handler';
import { extractBoolean } from '../../lib/query';

async function handler(req, res) {
  const { Block } = req.models;

  const author = req.query.author ? req.query.author.toLowerCase() : '';
  const skip = Number(req.query.skip) || 0;
  const limit = Number(req.query.limit) || 20;
  const reverse = extractBoolean(req.query.reverse, true);
  const fullTransactions = extractBoolean(req.query.fullTransactions, false);

  try {
    let filter = {};
    let total;
    let blocksQuery;

    if (author) {
      filter = { author };
      total = await Block.countDocuments(filter);
    } else {
      total = await Block.estimatedDocumentCount();
    }

    blocksQuery = Block.find(filter)
      .limit(limit)
      .skip(skip)
      .sort({ timestamp: reverse ? -1 : 1 });

    if (fullTransactions) {
      blocksQuery = blocksQuery.populate('transactions');
    }
    const blocks = await blocksQuery;

    res.json({ total, reverse, skip, limit, result: { blocks } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error. Please try your request again.' });
  }
}

export default withApiHandler(handler);
