import withApiHandler from '../../lib/api-handler';
import { extractBoolean } from '../../lib/query';

async function handler(req, res) {
  const {
    models: { Block },
    query: { cursorId, cursorTimestamp, author },
  } = req;

  const limit = Number(req.query.limit) || 20;
  const reverse = extractBoolean(req.query.reverse, true);
  const fullTransactions = extractBoolean(req.query.fullTransactions, false);

  try {
    let filter = {};
    let blocksQuery;
    if (author) {
      filter['author'] = author.toLowerCase();
    }
    if (cursorId && cursorTimestamp) {
      filter['$or'] = [
        { timestamp: { [reverse ? '$lt' : '$gt']: cursorTimestamp } },
        {
          timestamp: cursorTimestamp,
          _id: { $gt: cursorId },
        },
      ];
    }

    blocksQuery = Block.find(filter)
      .limit(limit)
      .sort({ timestamp: reverse ? -1 : 1, _id: 1 });

    if (fullTransactions) {
      blocksQuery = blocksQuery.populate('transactions');
    }

    const blocks = await blocksQuery;

    res.json({ reverse, limit, result: { blocks } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error. Please try your request again.' });
  }
}

export default withApiHandler(handler);
