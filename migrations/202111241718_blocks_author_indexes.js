#!/usr/bin/env node

const { createIndexes } = require('./migration');

(async () => {
  await createIndexes([
    ['Block', [{ author: 1, timestamp: -1 }, { background: true }]],
    ['Block', [{ author: 1, timestamp: 1 }, { background: true }]],
  ]);
})();
