import withApiHandler from '../../lib/api-handler';

async function handler(req, res) {
  const { DAGBlock, PBFTBlock } = req.models;
  let skip = Number(req.query.skip) || 0;
  let limit = Number(req.query.limit) || 20;
  let reverse = Boolean(req.query.reverse);
  let fullTransactions = Boolean(req.query.fullTransactions) || false;

  try {
    let blocks = [];
    let periods = [];
    const total = await DAGBlock.estimatedDocumentCount();
    if (fullTransactions) {
      blocks = await DAGBlock.find()
        .limit(limit)
        .skip(skip)
        .sort({ level: reverse ? -1 : 1 })
        .populate('transactions');
    } else {
      blocks = await DAGBlock.find()
        .limit(limit)
        .skip(skip)
        .sort({ level: reverse ? -1 : 1 });
    }

    blocks.forEach((block) => {
      if (block.period && !periods.includes(block.period)) {
        periods.push(block.period);
      }
    });
    let pbftBlocks = await PBFTBlock.find({ period: { $in: periods } }).sort({
      period: reverse ? -1 : 1,
    });

    res.json({
      total,
      reverse,
      skip,
      limit,
      result: {
        blocks,
        pbftBlocks,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error. Please try your request again.' });
  }
}

export default withApiHandler(handler);
