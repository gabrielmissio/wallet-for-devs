require('dotenv').config()
const BTCInitTxStrategy = require('../core/src/domain/strategies/init-transaction/btc-strategy')
const EVMInitTxStrategy = require('../core/src/domain/strategies/init-transaction/eth-strategy')

const keyName = 'any-key-alias'
const keyToMnemonic = new Map()
keyToMnemonic.set(keyName, process.env.DEVELOPMENT_MNEMONIC)

const btcSegWitTestnetBasePath = "m/44'/1'/0'"
// const btcLegacyTestnetBasePath = "m/84'/1'/0'"

const initTxStrategy = makeMATICTestnetUseCase()

initTxStrategy.initTransaction({
  keyName,
  basePath: btcSegWitTestnetBasePath,
  amount: Number(process.env.TX_VALUE),
  // changeAddress: process.env.TX_FROM, // temporary
  recipient: process.env.TX_TO
}).then(console.log)

// eslint-disable-next-line no-unused-vars
function makeBTCTestnetUseCase () {
  const BTCBlockchainAPI = require('../core/src/infra/apis/btc-blockchain-api')
  const HttpHelper = require('../core/src/infra/helpers/http-helper')
  const BTCKeyRepository = require('../core/src/infra/repositories/btc-key-repository')

  const btcTestnetHttpClient = new HttpHelper({
    baseURL: process.env.BTC_TESTNET_BLOCKCHAIN_API_URL,
    globalTimeout: 10000
  })
  const btcTestnetBlockchainApi = new BTCBlockchainAPI({ httpClient: btcTestnetHttpClient })
  const btcKeyRepositoryTestnet = new BTCKeyRepository({ keyToMnemonic }) // default network is testnet

  return new BTCInitTxStrategy({
    blockchainAPI: btcTestnetBlockchainApi,
    keyRepository: btcKeyRepositoryTestnet
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

  return new EVMInitTxStrategy({
    blockchainAPI: evmTestnetBlockchainApi,
    keyRepository: evmKeyRepositoryTestnet,
    rpcURL: process.env.ETH_TESTNET_RPC_URL,
    chainId: 11155111
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

  return new EVMInitTxStrategy({
    blockchainAPI: evmTestnetBlockchainApi,
    keyRepository: evmKeyRepositoryTestnet,
    rpcURL: process.env.MATIC_TESTNET_RPC_URL,
    chainId: 80002
  })
}
