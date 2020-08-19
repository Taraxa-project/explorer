#!/usr/bin/env node

const axios = require('axios');
const { program } = require('commander');
const pkg = require('../package.json');
const Web3 = require('web3');
const rpcHost = "127.0.0.1";
const web3 = new Web3(new Web3.providers.HttpProvider('http://'+rpcHost+':7777'));
const {taraxa,eth} = require("taraxa-js");
taraxa.set({ip:rpcHost,port:7777})
eth.set({ip:rpcHost,port:7777})

function rpcRequest(name, params = []) {
    const request = {
        "jsonrpc":"2.0",
        "id":0,
        "method":name,
        "params": params
    }
    return request;
}

function getAccountBalance(address) {
    const request = rpcRequest("get_account_balance", [{
        address
    }])
    return axios.post('http://'+rpcHost+':7777/', request);
}

function netVersion() {
    const request = rpcRequest("net_version")
    return axios.post('http://'+rpcHost+':7777/', request);
}

function netPeerCount() {
    const request = rpcRequest("net_peerCount")
    return axios.post('http://'+rpcHost+':7777/', request);
}

async function sendCoins(from, to, sk) {
    const account = web3.eth.accounts.privateKeyToAccount(sk);
    web3.eth.accounts.wallet.add(account);

    const tx = {
        from: '0x' + from,
        to: '0x' + to,
        value: 50000,
        "gas": 300000,
        "gasPrice": 1000000000,
    }

    console.log('Transaction:', tx)
    
    return web3.eth.sendTransaction(tx);
    // const signed = await account.signTransaction(tx);
    // console.log('signed tx', signed);
    // return web3.eth.sendSignedTransaction(signed);
}

program.version(pkg.version);

program
        .command('sendCoins')
        .option('-a, --address <type>', 'address to receive coins')
        .description('get coins from faucet')
        .action(async function (cmdObj) {
            const bootNodeConf = require('../conf/conf_taraxa1.json');
            const sk = bootNodeConf.node_secret;
            try {
                const response = await sendCoins('de2b1203d72d3549ee2f733b00b2789414c7cea5', cmdObj.address, sk);
                console.log(response);
            } catch (e) {
                console.error(e);
            }
        })

program
    .command('getNetworkVersion')
    .description('get taraxa network version')
    .action(async function () {
        const response = await netVersion();
        console.log(response.data);
    })

program
    .command('getPeers')
    .description('get taraxa network peers')
    .action(async function () {
        const response = await netPeerCount();
        console.log(response.data);
    })

program
    .command('getBalance')
    .option('-a, --address <type>', 'address to receive coins')
    .description('get taraxa account balance')
    .action(async function (cmdObj) {
        const response = await getAccountBalance(cmdObj.address);
        console.log(response.data);
    })

program
    .command('getBlockNumber')
    .description('get taraxa block number')
    .action(async function () {
        try {
            const blockNumber = await web3.eth.getBlockNumber();
            console.log(blockNumber);
        } catch (e) {
            console.error(e);
        }
        
    })

program
    .command('getBlockLevel')
    .description('get taraxa dag block level')
    .action(async function () {
        try {
            const blockNumber = await taraxa.dagBlockLevel();
            console.log(blockNumber);
        } catch (e) {
            console.error(e);
        }
        
    })

program.parse(process.argv)
