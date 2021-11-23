const { createIndexes } = require('./migration');

(async () => {
  await createIndexes([
    [
      'Tx',
      [
        { to: 1, status: 1, value: 1 },
        { background: true, sparse: true },
      ],
    ],
    [
      'Tx',
      [
        { from: 1, status: 1, value: 1 },
        { background: true, sparse: true },
      ],
    ],
    [
      'Tx',
      [
        { from: 1, gasUsed: 1, gasPrice: 1 },
        { background: true, sparse: true },
      ],
    ],
    ['Tx', [{ timestamp: -1 }, { background: true }]],
    ['Block', [{ timestamp: -1 }, { background: true }]],
    [
      'Block',
      [
        { author: 1, gasUsed: 1 },
        { background: true, sparse: true },
      ],
    ],
  ]);
})();
