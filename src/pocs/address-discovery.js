require('dotenv').config()
const AddressDiscoveryUseCase = require('../domain/use-cases/address-discovery-use-case')
const BTCBlockchainAPI = require('../infra/apis/btc-blockchain-api')
const HttpHelper = require('../infra/helpers/http-helper')
const BTCKeyRepository = require('../infra/repositories/btc-key-repository')

const keyName = 'any-key-alias'
const keyToMnemonic = new Map()
keyToMnemonic.set(keyName, process.env.DEVELOPMENT_MNEMONIC)

const btcTestnetHttpClient = new HttpHelper({
  baseURL: process.env.BTC_TESTNET_BLOCKCHAIN_API_URL,
  globalTimeout: 10000
})
const btcTestnetBlockchainApi = new BTCBlockchainAPI({ httpClient: btcTestnetHttpClient })
const btcKeyRepositoryTestnet = new BTCKeyRepository({ keyToMnemonic }) // default network is testnet

const btcSegWitTestnetBasePath = "m/84'/0'/0'"
// const btcLegacyTestnetBasePath = "m/44'/1'/0'"
// -> m/44'/1'/0'/1/1 + m/44'/1'/0'/0/3 HAS 0.00002 BTC

const addressDiscoveryUseCase = new AddressDiscoveryUseCase({
  blockchainAPI: btcTestnetBlockchainApi,
  keyRepository: btcKeyRepositoryTestnet,
  gapLimit: 5
})
addressDiscoveryUseCase.discoverPaymentAddress({
  keyName,
  basePath: btcSegWitTestnetBasePath
}).then(console.log)

/*
addressDiscoveryUseCase.discoverChangeAddress({
  keyName,
  basePath: btcSegWitTestnetBasePath
}).then(console.log)
*/
