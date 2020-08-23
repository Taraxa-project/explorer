module.exports = {
    mongo: {
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017/explorer-api',
        options: {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            keepAlive: true,
            socketTimeoutMS: 0,
            useFindAndModify: false
        }
    },
    port: process.env.PORT || 5000,
    taraxa: {
        node: {
            http: process.env.RPC_HTTP_PROVIDER || 'http://localhost:7777',
            ws: process.env.RPC_WS_PROVIDER || 'ws://localhost:8777'
        }
    }
};