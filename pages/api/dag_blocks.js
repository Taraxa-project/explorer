import withApiHandler from '../../lib/api-handler';

const MAX_LEVELS_PER_PAGE = 150;
const DEFAULT_LEVELS_PER_PAGE = 20;

async function handler(req, res) {
  const { DAGBlock, PBFTBlock } = req.models;
  let limit = Math.min(
    Math.max(1, Number(req.query.limit) || DEFAULT_LEVELS_PER_PAGE),
    MAX_LEVELS_PER_PAGE,
  );
  let level = req.query.level ? Number(req.query.level) : null;
  let reverse = req.query.reverse !== 'false';
  let fullTransactions = Boolean(req.query.fullTransactions);

  try {
    let periods = [];
    const { level: topLevel } = await DAGBlock.findOne().sort({ level: -1 }).limit(1);
    if (isNaN(level) || level === null) {
      level = reverse ? topLevel : 1;
    }
    if (req.query.calculateLevel) {
      return res.json({ topLevel, level });
    }

    const maxLevel = reverse ? Math.min(topLevel, level) : Math.min(topLevel, level + limit);
    const minLevel = reverse
      ? Math.max(1, Math.min(topLevel, level - limit))
      : Math.min(topLevel, level);

    let blocksQuery = await DAGBlock.find({ level: { $lte: maxLevel, $gte: minLevel } }).sort({
      level: reverse ? -1 : 1,
    });

    if (fullTransactions) {
      blocksQuery = blocksQuery.populate('transactions');
    }

    const blocks = await blocksQuery;

    blocks.forEach((block) => {
      if (block.period && !periods.includes(block.period)) {
        periods.push(block.period);
      }
    });
    const pbftBlocks = await PBFTBlock.find({ period: { $in: periods } }).sort({
      period: reverse ? -1 : 1,
    });

    res.json({ topLevel, level, reverse, result: { blocks, pbftBlocks } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error. Please try your request again.' });
  }
}

export default withApiHandler(handler);
