const utils = require('web3-utils');

function toChecksumAddress(address) {
  if (typeof address !== 'string') {
    address = address.toString();
  }
  address = address.trim();

  if (utils.isAddress(address)) {
    address = utils.toChecksumAddress(address);
  } else {
    throw new Error('Address is not valid.');
  }
  return address;
}

module.exports = { toChecksumAddress };
