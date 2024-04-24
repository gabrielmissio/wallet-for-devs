require('dotenv').config()
const AccountBalanceUseCase = require('../domain/use-cases/account-balance-use-case')

const keyName = 'any-key-alias'
const keyToMnemonic = new Map()
keyToMnemonic.set(keyName, process.env.DEVELOPMENT_MNEMONIC)

// const btcSegWitTestnetBasePath = "m/84'/1'/0'"
const btcLegacyTestnetBasePath = "m/84'/1'/0'"

const accountBalanceUseCase = makeBTCTestnetUseCase({ gapLimit: 5 })

accountBalanceUseCase.discoverAccountBalance({
  keyName,
  basePath: btcLegacyTestnetBasePath
}).then(({ balances, totalBalance }) => {
  console.table(balances)
  console.log(`total balance: ${totalBalance}`)
})

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

  return new AccountBalanceUseCase({
    blockchainAPI: btcTestnetBlockchainApi,
    keyRepository: btcKeyRepositoryTestnet,
    gapLimit
  })
}
