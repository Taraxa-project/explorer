const express = require('express');
const router = express.Router();

const blocks = require('./blocks');
const txs = require('./txs');

router.use(blocks);
router.use(txs);

module.exports = router;