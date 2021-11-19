import config from 'config';
import mongoose from 'mongoose';

import { runCorsMiddleware } from '../../../lib/cors';
import Tx from '../../../models/tx';

export default async function userHandler(req, res) {
  await runCorsMiddleware(req, res);
  try {
    mongoose.connection._readyState ||
      (await mongoose.connect(config.mongo.uri, config.mongo.options));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal error. Please try your request again.' });
  }
  const {
    query: { id },
    method,
  } = req;

  switch (method) {
    case 'GET':
      try {
        const tx = await Tx.findOne({ _id: id });
        if (tx) {
          return res.json(tx);
        }
        return res.status(404).json({ error: 'Not found' });
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
