require('dotenv').config()
// const { generateMnemonic } = require('../core/src/infra/helpers/key-helper')

const keyName = 'any-key-alias'
const keyToMnemonic = new Map()
keyToMnemonic.set(keyName, process.env.DEVELOPMENT_MNEMONIC)

const BTCKeyRepository = require('../core/src/infra/repositories/btc-key-repository')
const btcKeyRepository = new BTCKeyRepository({ keyToMnemonic }) // default network is testnet

const EVMKeyRepository = require('../core/src/infra/repositories/evm-key-repository')
const evmKeyRepository = new EVMKeyRepository({ keyToMnemonic }) // default network is testnet

console.log('btc segwit: ', btcKeyRepository.getKeyPair({
  keyName, path: "m/84'/0'/0'/0/0"
}))
console.log('eth: ', evmKeyRepository.getKeyPair({
  keyName, path: "m/44'/60'/0'/0/0"
}))
console.log('btc segwit testnet: ', btcKeyRepository.getKeyPair({
  keyName, path: "m/84'/1'/0'/0/0"
}))
console.log('eth testnet: ', evmKeyRepository.getKeyPair({
  keyName, path: "m/44'/1'/0'/0/0"
}))
