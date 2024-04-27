// INFRA
const BTCBlockchainAPI = require('../../../../../core/src/infra/apis/btc-blockchain-api')
const HTTPHelper = require('../../../../../core/src/infra/helpers/http-helper')
const BTCKeyRepository = require('../../../../../core/src/infra/repositories/btc-key-repository')

// DOMAIN
const { initializedWallets } = require('../../domain/services/wallet-service')
// TODO: review use of above strategies
const InitTxBTCStrategy = require('../../../../../core/src/domain/strategies/init-transaction/btc-strategy')
const SignTxBTCStrategy = require('../../../../../core/src/domain/strategies/sign-transaction/btc-segwit-strategy')

const AccountBalanceUseCase = require('../../../../../core/src/domain/use-cases/account-balance-use-case')
const AccountDiscoveryUseCase = require('../../../../../core/src/domain/use-cases/account-discovery-use-case')
const AddressDiscoveryUseCase = require('../../../../../core/src/domain/use-cases/address-discovery-use-case')
const BroadcastTxUseCase = require('../../../../../core/src/domain/use-cases/broadcast-transaction-use-case')
const ExportAccountUseCase = require('../../../../../core/src/domain/use-cases/export-account-use-case')
const SignTxUseCase = require('../../../../../core/src/domain/use-cases/sign-transaction-use-case')

// COMPONENTS
const btcTestnetHttpClient = new HTTPHelper({
  baseURL: process.env.BTC_TESTNET_BLOCKCHAIN_API_URL,
  globalTimeout: 10000
})
const btcTestnetBlockchainApi = new BTCBlockchainAPI({ httpClient: btcTestnetHttpClient })
const btcKeyRepositoryTestnet = new BTCKeyRepository({ keyToMnemonic: initializedWallets }) // default network is testnet

// FACTORIES
function makeAccountBalanceUseCase ({ gapLimit = 5 } = {}) {
  return new AccountBalanceUseCase({
    blockchainAPI: btcTestnetBlockchainApi,
    keyRepository: btcKeyRepositoryTestnet,
    gapLimit
  })
}

function makeAccountDiscoveryUseCase ({ gapLimit = 5 } = {}) {
  return new AccountDiscoveryUseCase({
    blockchainAPI: btcTestnetBlockchainApi,
    keyRepository: btcKeyRepositoryTestnet,
    gapLimit
  })
}

function makeAddressDiscoveryUseCase ({ gapLimit = 5 } = {}) {
  return new AddressDiscoveryUseCase({
    blockchainAPI: btcTestnetBlockchainApi,
    keyRepository: btcKeyRepositoryTestnet,
    gapLimit
  })
}

function makeBroadcastTxUseCase () {
  return new BroadcastTxUseCase({
    blockchainAPI: btcTestnetBlockchainApi
  })
}

function makeExportAccountUseCase () {
  return new ExportAccountUseCase({
    keyRepository: btcKeyRepositoryTestnet
  })
}

function makeSignTxUseCase () {
  return new SignTxUseCase({
    protocolStrategy: new SignTxBTCStrategy({
      keyRepository: btcKeyRepositoryTestnet
    })
  })
}

function makeInitTxUseCase () {
  return new InitTxBTCStrategy({
    blockchainAPI: btcTestnetBlockchainApi,
    keyRepository: btcKeyRepositoryTestnet
  })
}

module.exports = {
  makeAccountBalanceUseCase,
  makeAccountDiscoveryUseCase,
  makeAddressDiscoveryUseCase,
  makeBroadcastTxUseCase,
  makeExportAccountUseCase,
  makeSignTxUseCase,
  makeInitTxUseCase
}
