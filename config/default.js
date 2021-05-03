module.exports = {
  faucet: {
    maxUnconfirmed: Number(process.env.MAX_UNCONFIRMED) || 5000,
    //default address 0xde2b1203d72d3549EE2f733b00b2789414C7Cea5
    privateKey:
      process.env.FAUCET_PRIV_KEY ||
      "0x853d833ba84c5fc50980956cdb94926a1519876fda2c2ffb1b5e9899f8bf0d5f",
  },
  delegate: {
    trustedAddress:
      process.env.DELEGATE_TRUSTED_ADDRESS ||
      "0xfee090788d8eb89c63cdcf76c1d385446d766556",
    ownNode:
      process.env.DELEGATE_OWN_NODE ||
      "0x780fe8b2226cf212c55635de399ee4c2a860810c",
  },
  mongo: {
    uri: process.env.MONGO_URI || "mongodb://localhost:27017/explorer",
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      keepAlive: true,
      socketTimeoutMS: 0,
      useFindAndModify: false,
    },
  },
  taraxa: {
    node: {
      http: process.env.RPC_HTTP_PROVIDER || "http://localhost:7777",
      ws: process.env.RPC_WS_PROVIDER || "ws://localhost:8777",
    },
  },
};
