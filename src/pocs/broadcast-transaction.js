require('dotenv').config()
const BroadcastTransactionUseCase = require('../core/src/domain/use-cases/broadcast-transaction-use-case')

const signedTx = process.env.SIGNED_RAW_TX
const broadcastTransactionUseCase = makeMATICTestnetUseCase()

broadcastTransactionUseCase.broadcastTransaction({ signedTx })
  .then(console.log)

// eslint-disable-next-line no-unused-vars
function makeBTCTestnetUseCase () {
  const BTCBlockchainAPI = require('../core/src/infra/apis/btc-blockchain-api')
  const HttpHelper = require('../core/src/infra/helpers/http-helper')

  const btcTestnetHttpClient = new HttpHelper({
    baseURL: process.env.BTC_TESTNET_BLOCKCHAIN_API_URL,
    globalTimeout: 10000
  })
  const btcTestnetBlockchainApi = new BTCBlockchainAPI({ httpClient: btcTestnetHttpClient })

  return new BroadcastTransactionUseCase({
    blockchainAPI: btcTestnetBlockchainApi
  })
}

// eslint-disable-next-line no-unused-vars
function makeETHTestnetUseCase () {
  const { EtherscanAPI } = require('../core/src/infra/apis/evm-blockchain-api')
  const HttpHelper = require('../core/src/infra/helpers/http-helper')

  const ethTestnetExplorerClient = new HttpHelper({
    baseURL: process.env.ETH_TESTNET_BLOCKCHAIN_API_URL,
    globalTimeout: 10000
  })
  const ethTestnetRPCClient = new HttpHelper({
    baseURL: process.env.ETH_TESTNET_RPC_URL,
    globalTimeout: 10000
  })
  const evmTestnetBlockchainApi = new EtherscanAPI({
    explorerClient: ethTestnetExplorerClient,
    rpcClient: ethTestnetRPCClient
  })

  return new BroadcastTransactionUseCase({
    blockchainAPI: evmTestnetBlockchainApi
  })
}

function makeMATICTestnetUseCase ({ gapLimit = {} } = {}) {
  const { OkLinkAPI } = require('../core/src/infra/apis/evm-blockchain-api')
  const HttpHelper = require('../core/src/infra/helpers/http-helper')

  const ethTestnetExplorerClient = new HttpHelper({
    baseURL: process.env.MATIC_TESTNET_BLOCKCHAIN_API_URL,
    globalTimeout: 10000
  })
  const ethTestnetRPCClient = new HttpHelper({
    baseURL: process.env.MATIC_TESTNET_RPC_URL,
    globalTimeout: 10000
  })
  const evmTestnetBlockchainApi = new OkLinkAPI({ explorerClient: ethTestnetExplorerClient, rpcClient: ethTestnetRPCClient })

  return new BroadcastTransactionUseCase({
    blockchainAPI: evmTestnetBlockchainApi
  })
}
