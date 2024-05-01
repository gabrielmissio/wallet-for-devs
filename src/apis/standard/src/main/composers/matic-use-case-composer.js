// INFRA
const { OkLinkAPI: EVMBlockchainAPI } = require('../../../../../core/src/infra/apis/evm-blockchain-api')
const HTTPHelper = require('../../../../../core/src/infra/helpers/http-helper')
const EVMKeyRepository = require('../../../../../core/src/infra/repositories/evm-key-repository')

// DOMAIN
const { initializedWallets } = require('../../domain/services/wallet-service')
const InitTxEVMStrategy = require('../../../../../core/src/domain/strategies/init-transaction/eth-strategy')
const SignTxEVMStrategy = require('../../../../../core/src/domain/strategies/sign-transaction/evm-strategy')
const AccountBalanceUseCase = require('../../../../../core/src/domain/use-cases/account-balance-use-case')
const AccountDiscoveryUseCase = require('../../../../../core/src/domain/use-cases/account-discovery-use-case')
const AddressDiscoveryUseCase = require('../../../../../core/src/domain/use-cases/address-discovery-use-case')
const BroadcastTxUseCase = require('../../../../../core/src/domain/use-cases/broadcast-transaction-use-case')
const ExportAccountUseCase = require('../../../../../core/src/domain/use-cases/export-account-use-case')
const SignTxUseCase = require('../../../../../core/src/domain/use-cases/sign-transaction-use-case')

// COMPONENTS
const ethTestnetExplorerClient = new HTTPHelper({
  baseURL: process.env.MATIC_TESTNET_BLOCKCHAIN_API_URL,
  globalTimeout: 10000
})
const ethTestnetRCPClient = new HTTPHelper({
  baseURL: process.env.MATIC_TESTNET_RCP_URL,
  globalTimeout: 10000
})
const evmTestnetBlockchainApi = new EVMBlockchainAPI({
  explorerClient: ethTestnetExplorerClient,
  rcpClient: ethTestnetRCPClient
})
const evmKeyRepositoryTestnet = new EVMKeyRepository({ keyToMnemonic: initializedWallets }) // default network is testnet

// FACTORIES
function makeAccountBalanceUseCase ({ gapLimit = 5 } = {}) {
  return new AccountBalanceUseCase({
    blockchainAPI: evmTestnetBlockchainApi,
    keyRepository: evmKeyRepositoryTestnet,
    gapLimit,
    useChangePath: false // avoid unnecessary change address discovery
    // EVM Protocol doesn't have change addresses
  })
}

function makeAccountDiscoveryUseCase ({ gapLimit = 5 } = {}) {
  return new AccountDiscoveryUseCase({
    blockchainAPI: evmTestnetBlockchainApi,
    keyRepository: evmKeyRepositoryTestnet,
    gapLimit,
    useChangePath: false // avoid unnecessary change address discovery
    // EVM Protocol doesn't have change addresses
  })
}

function makeAddressDiscoveryUseCase ({ gapLimit = 5 } = {}) {
  return new AddressDiscoveryUseCase({
    blockchainAPI: evmTestnetBlockchainApi,
    keyRepository: evmKeyRepositoryTestnet,
    gapLimit
  })
}

function makeBroadcastTxUseCase () {
  return new BroadcastTxUseCase({
    blockchainAPI: evmTestnetBlockchainApi
  })
}

function makeExportAccountUseCase () {
  return new ExportAccountUseCase({
    keyRepository: evmKeyRepositoryTestnet
  })
}

function makeSignTxUseCase () {
  return new SignTxUseCase({
    protocolStrategy: new SignTxEVMStrategy({
      keyRepository: evmKeyRepositoryTestnet
    })
  })
}

function makeInitTxUseCase () {
  return new InitTxEVMStrategy({
    blockchainAPI: evmTestnetBlockchainApi,
    keyRepository: evmKeyRepositoryTestnet,
    rcpURL: process.env.MATIC_TESTNET_RCP_URL,
    chainId: 80002 // Amoy chainId
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
