import withApiHandler from '../../lib/api-handler';

async function handler(req, res) {
  const { Tx } = req.models;

  let skip = Number(req.query.skip) || 0;
  let limit = Number(req.query.limit) || 20;
  let reverse = Boolean(req.query.reverse);
  let blockHash = req.query.blockHash;

  const query = {};
  if (blockHash) {
    query.blockHash = blockHash;
  }

  try {
    const total = await Tx.estimatedDocumentCount();
    const txs = await Tx.find(query)
      .limit(limit)
      .skip(skip)
      .sort({ timestamp: reverse ? -1 : 1 });
    res.json({
      total,
      reverse,
      skip,
      limit,
      result: {
        txs,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error. Please try your request again.' });
  }
}

export default withApiHandler(handler);
