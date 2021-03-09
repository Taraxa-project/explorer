module.exports = {
    faucet: {
        maxUnconfirmed: Number(process.env.MAX_UNCONFIRMED) || 5000,
        //default address 0xde2b1203d72d3549EE2f733b00b2789414C7Cea5
        privateKey: process.env.FAUCET_PRIV_KEY || '0x3800b2875669d9b2053c1aff9224ecfdc411423aac5b5a73d7a45ced1c3b9dcd'
    },
    mongo: {
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017/explorer-dev',
        options: {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            keepAlive: true,
            socketTimeoutMS: 0,
            useFindAndModify: false
        }
    },
    taraxa: {
        node: {
            http: process.env.RPC_HTTP_PROVIDER || 'http://localhost:7777',
            ws: process.env.RPC_WS_PROVIDER || 'ws://localhost:8777'
        }
    }
};