import config from "config";
import mongoose from "mongoose";
import moment from "moment";

import Block from "../../models/block";

export default async function handler(req, res) {
  try {
    mongoose.connection._readyState ||
      (await mongoose.connect(config.mongo.uri, config.mongo.options));
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: "Internal error. Please try your request again." });
  }

  let skip = Number(req.query.skip) || 0;
  let limit = Number(req.query.limit) || 20;
  let week = Number(req.query.week) || moment().isoWeek();
  let year = Number(req.query.year) || moment().isoWeekYear();

  const now = moment().isoWeekYear(year).isoWeek(week);
  const firstDay = now.startOf("week").toDate();
  const lastDay = now.endOf("week").toDate();

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
        $group: { _id: "$author" },
      },
      {
        $count: "total",
      },
    ]);
    const nodes = await Block.aggregate([
      match,
      {
        $group: { _id: "$author", count: { $sum: 1 } },
      },
    ])
      .limit(limit)
      .skip(skip)
      .sort({ count: -1 });
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
    res
      .status(500)
      .json({ error: "Internal error. Please try your request again." });
  }
}
