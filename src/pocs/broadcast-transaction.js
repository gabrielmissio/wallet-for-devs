require('dotenv').config()
const BroadcastTransactionUseCase = require('../core/src/domain/use-cases/broadcast-transaction-use-case')

const signedTx = process.env.SIGNED_RAW_TX
const broadcastTransactionUseCase = makeBTCTestnetUseCase()

broadcastTransactionUseCase.broadcastTransaction({ signedTx })
  .then(console.log)

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
