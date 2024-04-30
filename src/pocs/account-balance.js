require('dotenv').config()
const AccountBalanceUseCase = require('../core/src/domain/use-cases/account-balance-use-case')

const keyName = 'any-key-alias'
const keyToMnemonic = new Map()
keyToMnemonic.set(keyName, process.env.DEVELOPMENT_MNEMONIC)

// const btcSegWitTestnetBasePath = "m/84'/1'/0'"
const btcLegacyTestnetBasePath = "m/44'/1'/0'"

const accountBalanceUseCase = makeETHTestnetUseCase({ gapLimit: 5 })

accountBalanceUseCase.discoverAccountBalance({
  keyName,
  basePath: btcLegacyTestnetBasePath,
  useChangePath: false // default is true
}).then(({ balances, totalBalance }) => {
  console.table(balances)
  console.log(`total balance: ${totalBalance}`)
})

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

  return new AccountBalanceUseCase({
    blockchainAPI: btcTestnetBlockchainApi,
    keyRepository: btcKeyRepositoryTestnet,
    gapLimit
  })
}

function makeETHTestnetUseCase ({ gapLimit = {} } = {}) {
  const EVMBlockchainAPI = require('../core/src/infra/apis/evm-blockchain-api')
  const HttpHelper = require('../core/src/infra/helpers/http-helper')
  const EVMKeyRepository = require('../core/src/infra/repositories/evm-key-repository')

  const btcTestnetHttpClient = new HttpHelper({
    baseURL: process.env.ETH_TESTNET_BLOCKCHAIN_API_URL,
    globalTimeout: 10000
  })
  const evmTestnetBlockchainApi = new EVMBlockchainAPI({ httpClient: btcTestnetHttpClient })
  const evmKeyRepositoryTestnet = new EVMKeyRepository({ keyToMnemonic })

  return new AccountBalanceUseCase({
    blockchainAPI: evmTestnetBlockchainApi,
    keyRepository: evmKeyRepositoryTestnet,
    gapLimit
  })
}
