const fs = require('fs')
require('dotenv').config()

const { generateMnemonic } = require('../core/src/infra/helpers/key-helper')
const AccountDiscoveryUseCase = require('../core/src/domain/use-cases/account-discovery-use-case')
const BTCBlockchainAPI = require('../core/src/infra/apis/btc-blockchain-api')
const HttpHelper = require('../core/src/infra/helpers/http-helper')
const BTCKeyRepository = require('../core/src/infra/repositories/btc-key-repository')

const keyToMnemonic = new Map()
const btcSegWitTestnetBasePath = "m/84'/0'/0'/0"

const btcTestnetHttpClient = new HttpHelper({
  baseURL: process.env.BTC_TESTNET_BLOCKCHAIN_API_URL,
  globalTimeout: 10000
})
const btcTestnetBlockchainApi = new BTCBlockchainAPI({ httpClient: btcTestnetHttpClient })
const btcKeyRepositoryTestnet = new BTCKeyRepository({ keyToMnemonic }) // default network is testnet
const accountDiscoveryUseCase = new AccountDiscoveryUseCase({
  blockchainAPI: btcTestnetBlockchainApi,
  keyRepository: btcKeyRepositoryTestnet,
  gapLimit: 1
})

async function main (bruteForceAttemptsLimit) {
  let attempts = 0
  let isEmptyAccount = true
  const keyName = 'brute-force-attack'

  while (isEmptyAccount && attempts < bruteForceAttemptsLimit) {
    const mnemonic = generateMnemonic() // process.env.DEVELOPMENT_MNEMONIC
    keyToMnemonic.set(keyName, mnemonic)
    console.log({ attempt: attempts, mnemonic })

    isEmptyAccount = await accountDiscoveryUseCase.checkAccountActivity({
      keyName,
      path: btcSegWitTestnetBasePath
    })

    if (!isEmptyAccount) {
      const foundAt = new Date().toISOString()
      fs.mkdirSync('../brute-force-attack', { recursive: true })
      fs.writeFileSync(`../brute-force-attack/${foundAt}.txt`, mnemonic)
      console.log(`Mnemonic saved into ../brute-force-attack/${foundAt}.txt`)
    }

    attempts++
  }

  console.log('\nBrute force attack finished!')
  if (isEmptyAccount) {
    console.log('No luck this time!')
  } else {
    console.log('You are the chosen one!')
  }
  console.log(`Total attempts: ${attempts}`)
}

// You can increase this limit whatever you want, it's almost impossible to find a non-empty account
const bruteForceAttemptsLimit = 50
main(bruteForceAttemptsLimit)
