import moment from 'moment';
import withApiHandler from '../../../../lib/api-handler';
import { toChecksumAddress } from '../../../../lib/utils';

async function handler(req, res) {
  const {
    method,
    query: { id },
    models: { Block },
  } = req;

  switch (method) {
    case 'GET':
      try {
        const address = toChecksumAddress(id);
        const rAddress = new RegExp(`^${address}`, 'i');

        let totalProduced = 0;
        let firstBlockTimestamp = null;
        let lastBlockTimestamp = null;
        let rank = null;
        let produced = 0;

        const blocksProduced = await Block.aggregate([
          {
            $match: {
              author: {
                $regex: rAddress,
              },
            },
          },
          {
            $sort: {
              timestamp: 1,
            },
          },
          {
            $group: {
              _id: '$author',
              count: { $sum: 1 },
              lastBlockTimestamp: { $last: '$timestamp' },
              firstBlockTimestamp: { $first: '$timestamp' },
            },
          },
        ]);

        if (blocksProduced.length > 0) {
          totalProduced = blocksProduced[0].count;
          lastBlockTimestamp = blocksProduced[0].lastBlockTimestamp;
          firstBlockTimestamp = blocksProduced[0].firstBlockTimestamp;

          const week = moment().isoWeek();
          const year = moment().isoWeekYear();

          const now = moment().isoWeekYear(year).isoWeek(week);
          const firstDay = now.startOf('week').toDate();
          const lastDay = now.endOf('week').toDate();

          const ranking = await Block.aggregate([
            {
              $match: {
                timestamp: {
                  $gte: firstDay,
                  $lte: lastDay,
                },
              },
            },
            {
              $group: {
                _id: '$author',
                lastBlockNumber: { $last: '$number' },
                count: { $sum: 1 },
              },
            },
            {
              $sort: {
                count: -1,
                lastBlockNumber: 1,
              },
            },
            {
              $group: {
                _id: {},
                rank: {
                  $push: {
                    _id: '$_id',
                    count: '$count',
                  },
                },
              },
            },
            {
              $unwind: {
                path: '$rank',
                includeArrayIndex: 'index',
              },
            },
            {
              $project: {
                _id: '$rank._id',
                count: '$rank.count',
                index: '$index',
              },
            },
            {
              $match: {
                _id: id,
              },
            },
          ]);

          if (ranking.length) {
            rank = ranking[0].index + 1;
            produced = ranking[0].count;
          }
        }
        return res.json({
          totalProduced,
          firstBlockTimestamp,
          lastBlockTimestamp,
          rank,
          produced,
        });
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal error. Please try your request again.' });
      }
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default withApiHandler(handler);
