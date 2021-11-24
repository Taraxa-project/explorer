import withApiHandler from '../../lib/api-handler';

async function handler(req, res) {
  const { Block } = req.models;

  let author = req.query.author ? req.query.author.toLowerCase() : '';
  let skip = Number(req.query.skip) || 0;
  let limit = Number(req.query.limit) || 20;
  let reverse = Boolean(req.query.reverse);
  let fullTransactions = Boolean(req.query.fullTransactions);

  try {
    let filter = {};
    let total;
    let blocks = [];

    if (author) {
      filter = { author };
      total = await Block.countDocuments(filter);
    } else {
      total = await Block.estimatedDocumentCount();
    }

    if (fullTransactions) {
      blocks = await Block.find(filter)
        .limit(limit)
        .skip(skip)
        .sort({ timestamp: reverse ? -1 : 1 })
        .populate('transactions');
    } else {
      blocks = await Block.find(filter)
        .limit(limit)
        .skip(skip)
        .sort({ timestamp: reverse ? -1 : 1 });
    }
    res.json({ total, reverse, skip, limit, result: { blocks } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error. Please try your request again.' });
  }
}

export default withApiHandler(handler);
