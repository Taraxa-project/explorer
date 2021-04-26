import config from "config";
import mongoose from "mongoose";

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
  const today = new Date();
  let month = Number(req.query.month);
  let year = Number(req.query.year) || today.getFullYear();

  if (month > 11 || month < 0) {
    month = today.getMonth();
  }

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

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
