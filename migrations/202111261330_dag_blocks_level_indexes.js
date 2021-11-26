#!/usr/bin/env node

const { createIndexes } = require('./migration');

(async () => {
  await createIndexes([
    ['DAGBlock', [{ level: 1 }, { background: true }]],
    ['DAGBlock', [{ level: -1 }, { background: true }]],
  ]);
})();
