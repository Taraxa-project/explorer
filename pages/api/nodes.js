import moment from 'moment';
import withApiHandler from '../../lib/api-handler';

async function handler(req, res) {
  const { Block } = req.models;
  let skip = Number(req.query.skip) || 0;
  let limit = Number(req.query.limit) || 20;
  let week = Number(req.query.week) || moment().isoWeek();
  let year = Number(req.query.year) || moment().isoWeekYear();

  const now = moment().isoWeekYear(year).isoWeek(week);
  const firstDay = now.startOf('week').toDate();
  const lastDay = now.endOf('week').toDate();

  try {
    const match = {
      $match: {
        timestamp: {
          $gte: firstDay,
          $lte: lastDay,
        },
      },
    };
    const total = await Block.aggregate([
      match,
      {
        $group: { _id: '$author' },
      },
      {
        $count: 'total',
      },
    ]);
    const nodes = await Block.aggregate([
      match,
      {
        $group: { _id: '$author', lastBlockNumber: { $last: '$number' }, count: { $sum: 1 } },
      },
    ])
      .sort({ count: -1, lastBlockNumber: 1 })
      .skip(skip)
      .limit(limit);
    res.json({
      total: total.length > 0 ? total[0].total : 0,
      skip,
      limit,
      result: {
        nodes,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error. Please try your request again.' });
  }
}

export default withApiHandler(handler);
