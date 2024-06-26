require('dotenv').config()
const AccountDiscoveryUseCase = require('../core/src/domain/use-cases/account-discovery-use-case')

const keyName = 'any-key-alias'
const keyToMnemonic = new Map()
keyToMnemonic.set(keyName, process.env.DEVELOPMENT_MNEMONIC)

// const btcSegWitTestnetBasePath = "m/84'/1'"
const btcSLegacyTestnetBasePath = "m/44'/1'"

const accountDiscoveryUseCase = makeMATICTestnetUseCase({ gapLimit: 5 })

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

// eslint-disable-next-line no-unused-vars
function makeETHTestnetUseCase ({ gapLimit = {} } = {}) {
  const { EtherscanAPI } = require('../core/src/infra/apis/evm-blockchain-api')
  const HttpHelper = require('../core/src/infra/helpers/http-helper')
  const EVMKeyRepository = require('../core/src/infra/repositories/evm-key-repository')

  const ethTestnetExplorerClient = new HttpHelper({
    baseURL: process.env.ETH_TESTNET_BLOCKCHAIN_API_URL,
    globalTimeout: 10000
  })
  const evmTestnetBlockchainApi = new EtherscanAPI({ explorerClient: ethTestnetExplorerClient })
  const evmKeyRepositoryTestnet = new EVMKeyRepository({ keyToMnemonic })

  return new AccountDiscoveryUseCase({
    blockchainAPI: evmTestnetBlockchainApi,
    keyRepository: evmKeyRepositoryTestnet,
    gapLimit,
    useChangePath: false // avoid unnecessary change address discovery
  })
}

function makeMATICTestnetUseCase ({ gapLimit = {} } = {}) {
  const { OkLinkAPI } = require('../core/src/infra/apis/evm-blockchain-api')
  const HttpHelper = require('../core/src/infra/helpers/http-helper')
  const EVMKeyRepository = require('../core/src/infra/repositories/evm-key-repository')

  const ethTestnetExplorerClient = new HttpHelper({
    baseURL: process.env.MATIC_TESTNET_BLOCKCHAIN_API_URL,
    globalTimeout: 10000
  })
  const ethTestnetRPCClient = new HttpHelper({
    baseURL: process.env.MATIC_TESTNET_RPC_URL,
    globalTimeout: 10000
  })
  const evmTestnetBlockchainApi = new OkLinkAPI({ explorerClient: ethTestnetExplorerClient, rpcClient: ethTestnetRPCClient })
  const evmKeyRepositoryTestnet = new EVMKeyRepository({ keyToMnemonic })

  return new AccountDiscoveryUseCase({
    blockchainAPI: evmTestnetBlockchainApi,
    keyRepository: evmKeyRepositoryTestnet,
    gapLimit: 5,
    useChangePath: false // avoid unnecessary change address discovery
  })
}
