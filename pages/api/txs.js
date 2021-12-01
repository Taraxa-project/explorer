import withApiHandler from '../../lib/api-handler';
import { extractBoolean } from '../../lib/query';

async function handler(req, res) {
  const {
    models: { Tx },
    query: { blockHash, cursorId, cursorTimestamp },
  } = req;

  const limit = Number(req.query.limit) || 20;
  const reverse = extractBoolean(req.query.reverse, true);

  try {
    let filter = {};
    if (blockHash) {
      filter['blockHash'] = blockHash;
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

    const txs = await Tx.find(filter)
      .limit(limit)
      .sort({ timestamp: reverse ? -1 : 1, _id: 1 });

    res.json({ reverse, limit, result: { txs } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error. Please try your request again.' });
  }
}

export default withApiHandler(handler);
