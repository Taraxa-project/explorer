# Taraxa Dev Testnet

## Starting a Private Taraxa Testnet


```
docker-compose up -d
```


This will start 5 taraxa nodes:

1. `de2b1203d72d3549ee2f733b00b2789414c7cea5` - Node 1: The boot node. This node has a special keypair that is hardcoded to have coins in the genesis block.
2. `973ecb1c08c8eb5a7eaa0d3fd3aab7924f2838b0` Node 2
3. `4fae949ac2b72960fbe857b56532e2d3c8418d5e` Node 3
4. `415cf514eb6a5a8bd4d325d4874eae8cf26bcfe0` Node 4
5. `b770f7a99d0b7ad9adf6520be77ca20ee99b0858` Node 5

Node 1 is configured as a `boot node`, and the other 4 are configured to connect to it on startup.

## Install dependencies to test RPC

```
npm i
```

### RPC Test Scripts

*Note: Scripts run against the boot node*

```sh
# check network version
> ./scripts/runCommand.js getNetworkVersion
{ id: 0, jsonrpc: '2.0', result: 'testnet' }

# get peers connected
> ./scripts/runCommand.js getPeers
{ id: 0, jsonrpc: '2.0', result: '0x4' }

# check balance of boot node address
> ./scripts/runCommand.js getBalance -a de2b1203d72d3549ee2f733b00b2789414c7cea5
{
  id: 0,
  jsonrpc: '2.0',
  result: { found: true, value: '9007199254740991' }
}

# send coins to node 2
> ./scripts/runCommand.js sendCoins -a 973ecb1c08c8eb5a7eaa0d3fd3aab7924f2838b0

# check node 2 balance
> ./scripts/runCommand.js getBalance -a 973ecb1c08c8eb5a7eaa0d3fd3aab7924f2838b0

```
