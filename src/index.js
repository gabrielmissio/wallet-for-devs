const { generateMnemonic } = require('./infra/helpers/key-helper')
const BTCKeyRepository = require('./infra/repositories/btc-key-repository')
const EVMKeyRepository = require('./infra/repositories/evm-key-repository')

const keyName = 'any-key-alias'
const keyToMnemonic = new Map()
keyToMnemonic.set(keyName, generateMnemonic())

const evmKeyRepository = new EVMKeyRepository({ keyToMnemonic })
const btcKeyRepositoryTestnet = new BTCKeyRepository({ keyToMnemonic }) // default network is testnet
const btcKeyRepositoryMainnet = new BTCKeyRepository({ keyToMnemonic, network: 'bitcoin' })

console.log(btcKeyRepositoryTestnet.getKeyPair(keyName, "m/44'/0'/0'/0/0"))
console.log(btcKeyRepositoryTestnet.getKeyPair(keyName, "m/44'/0'/0'/0/0"))
console.log(evmKeyRepository.getKeyPair(keyName, '', "m/44'/0'/0'/0/0"))

console.log(btcKeyRepositoryTestnet.getKeyPair(keyName, "m/44'/0'/0'/0/1"))
console.log(btcKeyRepositoryMainnet.getKeyPair(keyName, "m/44'/0'/0'/0/1"))
console.log(evmKeyRepository.getKeyPair(keyName, '', "m/44'/0'/0'/0/1"))
