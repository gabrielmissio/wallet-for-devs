require('dotenv').config()
const BroadcastTransactionUseCase = require('../core/src/domain/use-cases/broadcast-transaction-use-case')

const signedTx = process.env.SIGNED_RAW_TX
const broadcastTransactionUseCase = makeETHTestnetUseCase()

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

function makeETHTestnetUseCase () {
  const EVMBlockchainAPI = require('../core/src/infra/apis/evm-blockchain-api')
  const HttpHelper = require('../core/src/infra/helpers/http-helper')

  const ethTestnetExplorerClient = new HttpHelper({
    baseURL: process.env.ETH_TESTNET_BLOCKCHAIN_API_URL,
    globalTimeout: 10000
  })
  const ethTestnetRCPClient = new HttpHelper({
    baseURL: process.env.ETH_TESTNET_RPC_URL,
    globalTimeout: 10000
  })
  const evmTestnetBlockchainApi = new EVMBlockchainAPI({
    explorerClient: ethTestnetExplorerClient,
    rcpClient: ethTestnetRCPClient
  })

  return new BroadcastTransactionUseCase({
    blockchainAPI: evmTestnetBlockchainApi
  })
}
