#!/usr/bin/env node

const config = require('config');
const mongoose = require('mongoose');
const Web3 = require('web3-eth');

const taraxa = new Web3(new Web3.providers.HttpProvider(config.taraxa.node.http));

const Faucet = require('../models/faucet');
const FaucetNonce = require('../models/faucet-nonce');

const account = taraxa.accounts.privateKeyToAccount(config.faucet.privateKey);

async function drip() {
    const cups = await Faucet.find();
    for(let cup of cups) {
        const fn = await FaucetNonce.findOneAndUpdate({}, { $inc: { nonce: 1 }}, {upsert: true, new: true});
        const tx = {
            from: account.address,
            to: cup.address,
            value: 1 * 1e10,
            gas: 21000,
            gasPrice: 1,
            nonce: fn.nonce - 1
        };
        const signed = await account.signTransaction(tx);
        await new Promise((resolve, reject) => {
            let transactionHash = "";
            taraxa.sendSignedTransaction(signed.rawTransaction)
                .once('transactionHash', txHash => {
                    console.log('Sending tx', txHash, 'to', cup.address, 'from', account.address, 1 * 1e10);
                    transactionHash = txHash;
                    resolve(txHash);
                })
                .once('error', error => {
                    console.error(error);
                    reject(error);
                })
        });
    }
    await new Promise(resolve => {
        setTimeout(resolve, 5000);
    })
    await drip();
}

(async () => {
    try {
        await mongoose.connect(config.mongo.uri, config.mongo.options);
        console.log('Faucet started')
        await drip();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})()