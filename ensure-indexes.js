#!/usr/bin/env node
require('dotenv').config();
const { useDb } = require('./lib/db');

// 30m should be enough to create indices
const socketTimeoutMS = 60000 * 30;
const serverSelectionTimeoutMS = 60000 * 30;
const connectTimeoutMS = 60000 * 30;
const keepAliveInitialDelay = 5000;
const heartbeatFrequencyMS = 1000;

(async () => {
  try {
    const start = new Date();
    console.log('Creating indexes...');
    const models = await useDb({
      keepAliveInitialDelay,
      socketTimeoutMS,
      serverSelectionTimeoutMS,
      connectTimeoutMS,
      heartbeatFrequencyMS,
    });

    for (const model in models) {
      console.log(`Ensuring indexes for ${model}...`);
      await models[model].ensureIndexes();
    }

    const finish = new Date();
    const durationSeconds = (finish - start) / 1000;

    console.log(`Finished ensuring indexes in ${durationSeconds}s`);

    process.exit(0);
  } catch (e) {
    console.error('An error ocurred while ensuring the indexes');
    console.error(e);
    process.exit(1);
  }
})();
