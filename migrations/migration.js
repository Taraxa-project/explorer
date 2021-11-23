require('dotenv').config();
const { useDb } = require('../lib/db');

// 30m should be enough to create indices
const socketTimeoutMS = 60000 * 30;

async function createIndexes(specs) {
  try {
    const start = new Date();
    console.log('Creating indexes...');
    const models = await useDb({ socketTimeoutMS });

    let indexNumber = 0;
    for (const [model, args] of specs) {
      indexNumber++;
      console.log(`Creating index ${indexNumber}`);

      if (undefined === models[model]) {
        throw new Error(`Couldn't find model "${model}" for index ${indexNumber}`);
      }

      const indexName = await models[model].collection.createIndex(...args);

      console.log(`Created index ${indexNumber} for model ${model} with name "${indexName}"`);
    }

    const finish = new Date();
    const durationSeconds = (finish - start) / 1000;

    console.log(`Finished creating indexes in ${durationSeconds}s`);

    process.exit(0);
  } catch (e) {
    console.error('An error ocurred while creating the index');
    console.error(e);
    process.exit(1);
  }
}

module.exports = { createIndexes };