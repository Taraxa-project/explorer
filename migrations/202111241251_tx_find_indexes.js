#!/usr/bin/env node

const { createIndexes } = require('./migration');

(async () => {
  await createIndexes([
    ['Tx', [{ from: 1, timestamp: -1 }, { background: true }]],
    ['Tx', [{ to: 1, timestamp: -1 }, { background: true }]],
    ['Tx', [{ from: 1, timestamp: 1 }, { background: true }]],
    ['Tx', [{ to: 1, timestamp: 1 }, { background: true }]],
  ]);
})();
