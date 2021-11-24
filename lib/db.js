const mongoose = require('mongoose');
const config = require('config');
const models = require('../models');

const readyStates = {
  disconnected: 0,
  connected: 1,
  connecting: 2,
  disconnecting: 3,
};

let pendingPromise = null;

async function useDb(overrideOptions = {}, cb = null) {
  const { readyState } = mongoose.connection;

  // TODO: May need to handle concurrent requests
  // with a little bit more details (disconnecting, disconnected etc).
  if (readyState === readyStates.connected) {
    if (typeof cb === 'function') {
      return cb();
    }
    return models;
  } else if (pendingPromise) {
    // Wait for the already pending promise if there is one.
    await pendingPromise;
    if (typeof cb === 'function') {
      return cb();
    }
    return models;
  }
  const options = Object.assign({}, config.mongo.options, overrideOptions);
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (hot module replacement).
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = mongoose.connect(config.mongo.uri, options);
    }
    pendingPromise = global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    pendingPromise = mongoose.connect(config.mongo.uri, options);
  }

  try {
    await pendingPromise;
  } finally {
    pendingPromise = null;
  }

  if (typeof cb === 'function') {
    return cb();
  }
  return models;
}

function withDb(handler, overrideOptions = {}) {
  return async (req, res) => {
    const next = () => {
      req.models = models;
      return handler(req, res);
    };

    return useDb(overrideOptions, next);
  };
}

module.exports = {
  withDb,
  useDb,
};
