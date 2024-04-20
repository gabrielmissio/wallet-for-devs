const { generateMnemonic } = require('./infra/helpers/key-helper')
const BTCKeyRepository = require('./infra/repositories/btc-key-repository')

const keyName = 'any-key-alias'
const mnemonic = generateMnemonic()

const keyRepositoryTestnet = new BTCKeyRepository() // default network is testnet
const keyRepositoryMainnet = new BTCKeyRepository({ network: 'bitcoin' })
keyRepositoryTestnet.keyToMnemonic.set(keyName, mnemonic)
keyRepositoryMainnet.keyToMnemonic.set(keyName, mnemonic)

console.log(keyRepositoryTestnet.getKeyPair(keyName, "m/44'/0'/0'/0/0"))
console.log(keyRepositoryMainnet.getKeyPair(keyName, "m/44'/0'/0'/0/0"))

console.log(keyRepositoryTestnet.getKeyPair(keyName, "m/44'/0'/0'/0/1"))
console.log(keyRepositoryMainnet.getKeyPair(keyName, "m/44'/0'/0'/0/1"))
