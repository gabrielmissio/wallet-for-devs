require('dotenv').config()
const AccountDiscoveryUseCase = require('../core/src/domain/use-cases/account-discovery-use-case')

const keyName = 'any-key-alias'
const keyToMnemonic = new Map()
keyToMnemonic.set(keyName, process.env.DEVELOPMENT_MNEMONIC)

// const btcSegWitTestnetBasePath = "m/84'/1'"
const btcSLegacyTestnetBasePath = "m/44'/1'"

const accountDiscoveryUseCase = makeETHTestnetUseCase({ gapLimit: 5 })

accountDiscoveryUseCase.discoverFirstEmptyAccount({
  keyName,
  basePath: btcSLegacyTestnetBasePath
}).then(console.log)

// eslint-disable-next-line no-unused-vars
function makeBTCTestnetUseCase ({ gapLimit = 5 }) {
  const BTCBlockchainAPI = require('../core/src/infra/apis/btc-blockchain-api')
  const HttpHelper = require('../core/src/infra/helpers/http-helper')
  const BTCKeyRepository = require('../core/src/infra/repositories/btc-key-repository')

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

function makeETHTestnetUseCase ({ gapLimit = {} } = {}) {
  const EVMBlockchainAPI = require('../core/src/infra/apis/evm-blockchain-api')
  const HttpHelper = require('../core/src/infra/helpers/http-helper')
  const EVMKeyRepository = require('../core/src/infra/repositories/evm-key-repository')

  const ethTestnetHttpClient = new HttpHelper({
    baseURL: process.env.ETH_TESTNET_BLOCKCHAIN_API_URL,
    globalTimeout: 10000
  })
  const evmTestnetBlockchainApi = new EVMBlockchainAPI({ explorerClient: ethTestnetHttpClient })
  const evmKeyRepositoryTestnet = new EVMKeyRepository({ keyToMnemonic })

  return new AccountDiscoveryUseCase({
    blockchainAPI: evmTestnetBlockchainApi,
    keyRepository: evmKeyRepositoryTestnet,
    gapLimit,
    useChangePath: false // avoid unnecessary change address discovery
  })
}
