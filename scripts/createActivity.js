#!/usr/bin/env node

const Web3 = require('web3-eth');
const rpcHost = '127.0.0.1';

const taraxa = new Web3(new Web3.providers.HttpProvider(`http://${rpcHost}:7777`));
// taraxa.defaultCommon = {
//     customChain: {
//         name: 'taraxa-testnet',
//         chainId: 1,
//         networkId: 1
//     },
// };

const nodeConfs = [
    require('../dockerfiles/conf_taraxa1.json'),
    require('../dockerfiles/conf_taraxa2.json'),
    require('../dockerfiles/conf_taraxa3.json'),
    require('../dockerfiles/conf_taraxa4.json'),
    require('../dockerfiles/conf_taraxa5.json')
];

const node = {};

for (let i = 0; i < nodeConfs.length; i++) {
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

    const balance = node[sender].balance;

    if (balance) {
        const value = Math.round(balance * .1);
        if (value) {
            const tx = {
                from: sender,
                to: receiver,
                value,
                gas: 21000,
                gasPrice: 0,
                chainId: 1,
                nonce: node[sender].nonce
            };

            node[sender].balance = node[sender].balance - value;
            node[receiver].balance = node[receiver].balance + value;
            node[sender].nonce = node[sender].nonce + 1;
    
            transactions++;
    
            // return taraxa.sendTransaction(tx);
            const signed = await node[sender].account.signTransaction(tx);
            // await taraxa.sendSignedTransaction(signed.rawTransaction)
            return new Promise((resolve, reject) => {
                let transactionHash = "";
                setTimeout(() => {              
                    taraxa.sendSignedTransaction(signed.rawTransaction)
                        .once('transactionHash', txHash => {
                            console.log('Sending tx', transactions.toLocaleString(), txHash);
                            transactionHash = txHash;
                            resolve(txHash);
                        })
                        // .once('sent', payload => {
                        //     console.log('Sent tx', transactions.toLocaleString(), payload);
                        // })
                        .once('receipt', payload => {
                            console.log(' * Confirmed tx', transactions.toLocaleString(), transactionHash);
                        })
                        .once('error', error => {
                            console.error(error);
                            reject(error);
                        })
                }, 1500)
            });
        }
    }
}

async function getStartingBalances() {
    for(const address of Object.keys(node)) {
        const balance = await taraxa.getBalance(address);
        node[address].balance = Number(balance);
    }
}

async function getStartingNonces() {
    for(const address of Object.keys(node)) {
        const nonce = await taraxa.getTransactionCount(address, 'pending');
        node[address].nonce = Number(nonce);
    }
}

(async () => {
    await getStartingBalances()
    await getStartingNonces();
    while (true) {
        try {
            await sendRandomTransaction();
        } catch (e) {
            console.log(e);
        }
    }
})();