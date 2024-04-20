const { generateMnemonic } = require('./infra/helpers/key-helper')
const BTCKeyRepository = require('./infra/repositories/btc-key-repository')
const EVMKeyRepository = require('./infra/repositories/evm-key-repository')

const keyName = 'any-key-alias'
const mnemonic = generateMnemonic()

const evmKeyRepository = new EVMKeyRepository()
const btcKeyRepositoryTestnet = new BTCKeyRepository() // default network is testnet
const btcKeyRepositoryMainnet = new BTCKeyRepository({ network: 'bitcoin' })
btcKeyRepositoryTestnet.keyToMnemonic.set(keyName, mnemonic)
btcKeyRepositoryMainnet.keyToMnemonic.set(keyName, mnemonic)
evmKeyRepository.keyToMnemonic.set(keyName, mnemonic)

console.log(btcKeyRepositoryTestnet.getKeyPair(keyName, "m/44'/0'/0'/0/0"))
console.log(btcKeyRepositoryTestnet.getKeyPair(keyName, "m/44'/0'/0'/0/0"))
console.log(evmKeyRepository.getKeyPair(keyName, '', "m/44'/0'/0'/0/0"))

console.log(btcKeyRepositoryTestnet.getKeyPair(keyName, "m/44'/0'/0'/0/1"))
console.log(btcKeyRepositoryMainnet.getKeyPair(keyName, "m/44'/0'/0'/0/1"))
console.log(evmKeyRepository.getKeyPair(keyName, '', "m/44'/0'/0'/0/1"))
