import utils from 'web3-utils';
import withApiHandler from '../../lib/api-handler';

async function handler(req, res) {
  const { DAGBlock, Block, Tx } = req.models;

  let queryString = req.query.query || '';
  queryString = queryString.trim();

  try {
    let blocks = [];
    let dagBlocks = [];
    let txs = [];

    if (queryString) {
      if (utils.isHexStrict(queryString)) {
        const hex = queryString.toLowerCase();
        blocks = await Block.find({ _id: hex }).limit(1);
        dagBlocks = await DAGBlock.find({ _id: hex }).limit(1);
        txs = await Tx.find({ _id: hex }).limit(1);
      } else if (!isNaN(Number(queryString))) {
        blocks = await Block.find({ number: Number(queryString) }).limit(1);
        dagBlocks = await DAGBlock.find({ level: Number(queryString) }).limit(1);
      } else {
        return res.status(400).json({ error: 'Invalid search parameters.' });
      }
    }

    res.json({
      blocks,
      dagBlocks,
      txs,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error. Please try your request again.' });
  }
}

export default withApiHandler(handler);
