module.exports = {
    faucet: {
        maxUnconfirmed: Number(process.env.MAX_UNCONFIRMED) || 5000,
        //default address 0xe414bd813ca44201b5e109d8e8f1aab5db4000d9
        privateKey: process.env.FAUCET_PRIV_KEY || '0xe5fd43923a0e926f33e67833462422eb7d4e77da296797127c4ad6db3ef544d0'
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