#!/usr/bin/env node

const Web3 = require('web3-eth');
const rpcHost = '127.0.0.1';

const taraxa = new Web3(new Web3.providers.HttpProvider(`http://${rpcHost}:7777`));
// taraxa.defaultCommon = {
//     customChain: {
//         name: 'taraxa-testnet',
//         chainId: null,
//         networkId: 1
//     },
// };

const nodeConfs = {
    1: require('../dockerfiles/conf_taraxa1.json'),
    2: require('../dockerfiles/conf_taraxa2.json'),
    3: require('../dockerfiles/conf_taraxa3.json'),
    4: require('../dockerfiles/conf_taraxa4.json'),
    5: require('../dockerfiles/conf_taraxa5.json'),
};

const node = {};

for (let i = 1; i <= 5; i++) {
    const privateKey = nodeConfs[i].node_secret;

    const account = taraxa.accounts.privateKeyToAccount(privateKey);

    node[account.address] = {
        account,
        privateKey,
        nonce: 0
    };
}

let transactions = 0;

async function sendRandomTransaction() {
    const senderIndex = Math.floor(Math.random() * Object.keys(node).length);
    const sender = Object.keys(node)[senderIndex];
    const receiverIndex = Math.floor(Math.random() * Object.keys(node).length);
    const receiver = Object.keys(node)[receiverIndex];

    const balance = await taraxa.getBalance(sender);

    if (Number(balance)) {
        const tx = {
            from: sender,
            to: receiver,
            value: Math.round(Number(balance) * .1),
            gas: 21000,
            // "gasPrice": 1000000000,
            // chainId: null,
            // nonce: 0
        };

        console.log('Sending Transaction ', transactions, tx);

        transactions++;

        // return taraxa.sendTransaction(tx);
        const signed = await node[sender].account.signTransaction(tx);
        console.log('signed tx', signed);
        return taraxa.sendSignedTransaction(signed.rawTransaction);
    }
}

async function sendRandomTransactions() {
    for (const address of Object.keys(node)){
        
    }
}

(async () => {
    while (true) {
        try {
            const started = new Date();
            await sendRandomTransaction();
            const complete = new Date();
            console.log('Completed in', complete - started, 'ms');
        } catch (e) {
            console.log(e);
        }

    }
})();