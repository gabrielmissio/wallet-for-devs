require('dotenv').config()
const AccountDiscoveryUseCase = require('../domain/use-cases/account-discovery-use-case')

const keyName = 'any-key-alias'
const keyToMnemonic = new Map()
keyToMnemonic.set(keyName, process.env.DEVELOPMENT_MNEMONIC)

// const btcSegWitTestnetBasePath = "m/84'/1'"
const btcSLegacyTestnetBasePath = "m/44'/1'"

const accountDiscoveryUseCase = makeBTCTestnetUseCase({ gapLimit: 5 })

accountDiscoveryUseCase.discoverFirstEmptyAccount({
  keyName,
  basePath: btcSLegacyTestnetBasePath
}).then(console.log)

function makeBTCTestnetUseCase ({ gapLimit = 5 }) {
  const BTCBlockchainAPI = require('../infra/apis/btc-blockchain-api')
  const HttpHelper = require('../infra/helpers/http-helper')
  const BTCKeyRepository = require('../infra/repositories/btc-key-repository')

  const btcTestnetHttpClient = new HttpHelper({
    baseURL: process.env.BTC_TESTNET_BLOCKCHAIN_API_URL,
    globalTimeout: 10000
  })
  const btcTestnetBlockchainApi = new BTCBlockchainAPI({ httpClient: btcTestnetHttpClient })
  const btcKeyRepositoryTestnet = new BTCKeyRepository({ keyToMnemonic }) // default network is testnet

  return new AccountDiscoveryUseCase({
    blockchainAPI: btcTestnetBlockchainApi,
    keyRepository: btcKeyRepositoryTestnet,
    gapLimit
  })
}
