#!/usr/bin/env node

const Web3 = require('web3');
const rpcHost = "127.0.0.1";

const web3 = new Web3(new Web3.providers.HttpProvider('http://'+rpcHost+':7777'));
web3.eth.defaultCommon = {
    customChain: {
        name: 'taraxa-testnet', 
        chainId: 1, 
        networkId: 1
    },
};

const nodeConfs = {
    1: require('../conf/conf_taraxa1.json'),
    2: require('../conf/conf_taraxa2.json'),
    3: require('../conf/conf_taraxa3.json'),
    4: require('../conf/conf_taraxa4.json'),
    5: require('../conf/conf_taraxa5.json'),
}

const node = {};

for(let i = 1; i <= 5; i++){
    const privateKey = nodeConfs[i].node_secret;

    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);

    node[account.address] = {
        privateKey
    }
}

let transactions = 0;

async function sendRandomTransaction() {
    const senderIndex = Math.floor(Math.random() * Object.keys(node).length)
    const sender = Object.keys(node)[senderIndex];
    const receiverIndex = Math.floor(Math.random() * Object.keys(node).length)
    const receiver = Object.keys(node)[receiverIndex];

    const balance = await web3.eth.getBalance(sender);

    if (Number(balance)) {
        const tx = {
            from: sender,
            to: receiver,
            value: Math.round(Number(balance) * .1),
            gas: 21000,
            // "gasPrice": 1000000000,
            chainId: 1,
            // nonce: 0
        }
    
        console.log('Sending Transaction ', transactions, tx);

        transactions++;
    
        return web3.eth.sendTransaction(tx);
    }
}

(async () => {
    while (true) {
        try {
            const started = new Date();
            await sendRandomTransaction();
            const complete = new Date();
            console.log('Completed in', complete - started, 'ms')
        } catch (e) {
            console.log(e);
        }
        
    }
})()