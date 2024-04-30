require('dotenv').config()
const AddressDiscoveryUseCase = require('../core/src/domain/use-cases/address-discovery-use-case')

const keyName = 'any-key-alias'
const keyToMnemonic = new Map()
keyToMnemonic.set(keyName, process.env.DEVELOPMENT_MNEMONIC)

// const btcSegWitTestnetBasePath = "m/84'/1'/0'"
const btcLegacyTestnetBasePath = "m/44'/1'/0'"

const addressDiscoveryUseCase = makeETHTestnetUseCase({ gapLimit: 5 })

addressDiscoveryUseCase.discoverPaymentAddress({
  keyName,
  basePath: btcLegacyTestnetBasePath
}).then(console.log)

/*
addressDiscoveryUseCase.discoverChangeAddress({
  keyName,
  basePath: btcSegWitTestnetBasePath
}).then(console.log)
*/

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

  return new AddressDiscoveryUseCase({
    blockchainAPI: btcTestnetBlockchainApi,
    keyRepository: btcKeyRepositoryTestnet,
    gapLimit: 5
  })
}

function makeETHTestnetUseCase ({ gapLimit = {} } = {}) {
  const EVMBlockchainAPI = require('../core/src/infra/apis/evm-blockchain-api')
  const HttpHelper = require('../core/src/infra/helpers/http-helper')
  const EVMKeyRepository = require('../core/src/infra/repositories/evm-key-repository')

  const ethTestnetHttpClient = new HttpHelper({
    baseURL: process.env.ETH_TESTNET_BLOCKCHAIN_API_URL,
    globalTimeout: 10000
  })
  const evmTestnetBlockchainApi = new EVMBlockchainAPI({ explorerClient: ethTestnetHttpClient })
  const evmKeyRepositoryTestnet = new EVMKeyRepository({ keyToMnemonic })

  return new AddressDiscoveryUseCase({
    blockchainAPI: evmTestnetBlockchainApi,
    keyRepository: evmKeyRepositoryTestnet,
    gapLimit: 5
  })
}
