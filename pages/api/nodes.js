import config from "config";
import mongoose from "mongoose";

import Node from "../../models/node";

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
  let reverse = Boolean(req.query.reverse);

  try {
    const total = await Node.countDocuments();
    const nodes = await Node.find()
      .limit(limit)
      .skip(skip)
      .sort({ blocks: reverse ? -1 : 1 });
    res.json({
      total,
      reverse,
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
