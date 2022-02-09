import config from 'config';
import BN from 'bn.js';
import Web3Utils from 'web3-utils';
import * as ethUtil from 'ethereumjs-util';
import * as fs from 'fs';
import { useDb } from './db';

const ELIGIBILITY_THRESHOLD = new BN('1000000').mul(new BN('10').pow(new BN('18')));

export function verifyAddress(id, sig) {
  let address = id;

  if (typeof address !== 'string') {
    address = address.toString();
  }
  address = address.trim();

  if (!Web3Utils.isAddress(address)) {
    throw new Error('Wallet Address is not valid.');
  }

  try {
    const { v, r, s } = ethUtil.fromRpcSig(sig);
    const sigAddress = ethUtil.bufferToHex(
      ethUtil.pubToAddress(ethUtil.ecrecover(ethUtil.keccak256(address), v, r, s)),
    );
    if (sigAddress !== config.delegate.trustedAddress) {
      throw new Error('Signature is not valid.');
    }
  } catch (e) {
    throw new Error('Signature is not valid.');
  }

  return address;
}

export async function delegateTo(address) {
  const { Delegate } = await useDb();

  const delegate = await Delegate.create({
    node: address,
    counterpart: getOwnNode(),
    valueToAdd: ELIGIBILITY_THRESHOLD.toString(),
    valueToSubstract: '0',
    status: 'QUEUED',
  });
  return await delegate.save();
}

export async function undelegateFrom(address) {
  const { Delegate } = await useDb();

  const undelegate = await Delegate.create({
    node: address,
    counterpart: getOwnNode(),
    valueToAdd: '0',
    valueToSubstract: ELIGIBILITY_THRESHOLD.toString(),
    status: 'QUEUED',
  });
  return await undelegate.save();
}

function getOwnNode() {
  let nodes = [];

  if (config.delegation.ownNodes) {
    nodes = JSON.parse(config.delegation.ownNodes);
  } else {

    let taraxaConfig;

    try {
      taraxaConfig = JSON.parse(fs.readFileSync(config.nodeConfigPath, 'utf8'));
    } catch (e) {
      throw new Error(`Could not open node config file: ${config.nodeConfigPath}`);
    }

    const genesisState = taraxaConfig?.final_chain?.state?.dpos?.genesis_state || {};
    const keys = Object.keys(genesisState);

    if (keys.length < 1) {
      return [];
    }

    nodes = Object.keys(genesisState[keys[0]]);
  }

  const randomIndex = Math.floor(Math.random() * nodes.length);
  return nodes[randomIndex];
}
