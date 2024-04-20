require('dotenv').config()
const AccountDiscoveryUseCase = require('../domain/use-cases/account-discovery-use-case')
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

const btcSegWitTestnetBasePath = "m/84'/1'"

const accountDiscoveryUseCase = new AccountDiscoveryUseCase({
  blockchainAPI: btcTestnetBlockchainApi,
  keyRepository: btcKeyRepositoryTestnet,
  gapLimit: 5
})

accountDiscoveryUseCase.discoverFirstEmptyAccount({
  keyName,
  basePath: btcSegWitTestnetBasePath
}).then(console.log)
