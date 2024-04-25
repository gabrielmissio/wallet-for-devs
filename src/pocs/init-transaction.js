require('dotenv').config()
const BTCInitTxStrategy = require('../domain/strategies/init-transaction/btc-strategy')

const keyName = 'any-key-alias'
const keyToMnemonic = new Map()
keyToMnemonic.set(keyName, process.env.DEVELOPMENT_MNEMONIC)

// const btcSegWitTestnetBasePath = "m/84'/1'/0'"
// const btcLegacyTestnetBasePath = "m/84'/1'/0'"

const initTxStrategy = makeBTCTestnetUseCase()

initTxStrategy.selectUTXOs(Number(process.env.TX_VALUE), process.env.TX_FROM)
  .then(({ selectedUTXOs, fee }) => {
    console.log({ fee })
    console.log({ selectedUTXOs })

    initTxStrategy.createLegacyPSBT({
      amount: Number(process.env.TX_VALUE),
      changeAddress: process.env.TX_FROM, // temporary
      recipientAddress: process.env.TX_TO,
      selectedUTXOs
    }).then((result) => {
      console.log(result)
    })
  })

function makeBTCTestnetUseCase () {
  const BTCBlockchainAPI = require('../infra/apis/btc-blockchain-api')
  const HttpHelper = require('../infra/helpers/http-helper')
  const BTCKeyRepository = require('../infra/repositories/btc-key-repository')

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
