#!/usr/bin/env node

const config = require('config');
const mongoose = require('mongoose');
const Web3 = require('web3-eth');

const taraxa = new Web3(new Web3.providers.HttpProvider(config.taraxa.node.http));

const Faucet = require('../models/faucet');
const FaucetNonce = require('../models/faucet-nonce');

const account = taraxa.accounts.privateKeyToAccount(config.faucet.privateKey);

let unconfirmed = 0;

async function drip() {
    if (unconfirmed <= config.faucet.maxUnconfirmed) {
        const cups = await Faucet.find().sort({created: -1}).limit(config.faucet.maxUnconfirmed - unconfirmed);
        for(let cup of cups) {
            const fn = await FaucetNonce.findOneAndUpdate({}, { $inc: { nonce: 1 }}, {upsert: true, new: true});
            const tx = {
                from: account.address,
                to: cup.address,
                value: 1 * 1e17,
                gas: 21000,
                gasPrice: 1 * 1e9,
                nonce: fn.nonce - 1
            };
            const signed = await account.signTransaction(tx);
            await new Promise((resolve, reject) => {
                let transactionHash = "";
                taraxa.sendSignedTransaction(signed.rawTransaction)
                    .once('transactionHash', txHash => {
                        console.log('Sending tx', txHash, 'to', cup.address, 'from', account.address, 1 * 1e10);
                        transactionHash = txHash;
                        unconfirmed++;
                        resolve(txHash);
                    })
                    .once('receipt', function(receipt){ 
                        unconfirmed--;
                    })
                    .once('error', error => {
                        console.error(error);
                        reject(error);
                    })
            });
        }
    } else {
        console.log('Skipping a round due to unconfirmed count', unconfirmed);
    }
    await new Promise(resolve => {
        const random = Math.random();
        const delay = Math.floor((random * 3000))
        setTimeout(resolve, delay);
    })
}

(async () => {
    try {
        await mongoose.connect(config.mongo.uri, config.mongo.options);
        console.log('Faucet started')
        while(true) {
            await drip();
        }
        
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})()