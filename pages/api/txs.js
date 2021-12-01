import withApiHandler from '../../lib/api-handler';
import { extractBoolean } from '../../lib/query';

async function handler(req, res) {
  const {
    models: { Tx },
    query: { blockHash, cursorId, cursorTimestamp, address },
  } = req;

  const limit = Number(req.query.limit) || 20;
  const reverse = extractBoolean(req.query.reverse, true);
  let cursorFilter = [];
  let addressFilter = [];

  try {
    let filter = {};
    if (blockHash) {
      filter['blockHash'] = blockHash;
    }
    if (cursorId && cursorTimestamp) {
      cursorFilter = [
        { timestamp: { [reverse ? '$lt' : '$gt']: cursorTimestamp } },
        {
          timestamp: cursorTimestamp,
          _id: { $gt: cursorId },
        },
      ];
    }
    if (address) {
      addressFilter = [{ from: address }, { to: address }];
    }

    if (addressFilter.length > 0 && cursorFilter.length > 0) {
      filter['$and'] = [{ $or: addressFilter }, { $or: cursorFilter }];
    } else if (addressFilter.length > 0) {
      filter['$or'] = addressFilter;
    } else if (cursorFilter.length > 0) {
      filter['$or'] = cursorFilter;
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
