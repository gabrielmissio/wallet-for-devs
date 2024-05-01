require('dotenv').config()
const qrcode = require('qrcode-terminal')
const SignTransactionUseCase = require('../core/src/domain/use-cases/sign-transaction-use-case')

const keyName = 'any-key-alias'
const keyToMnemonic = new Map()
keyToMnemonic.set(keyName, process.env.DEVELOPMENT_MNEMONIC)

// options: btcSegWitTestnet, btcLegacyTestnet
const { signTxUseCase, basePath, payload } = makeComponents('ethTestnet')

signTxUseCase.signTransaction({
  keyName, basePath, payload
}).then((data) => {
  qrcode.generate(data.qrCodeData, { small: true })
  console.log(data.qrCodeData)
})

function makeComponents (option) {
  const options = {
    btcSegWitTestnet: {
      basePath: "m/84'/1'/0'",
      payload: process.env.RAW_TX,
      signTxUseCase: makeBTCSegWitTestnetUseCase()
    },

    btcLegacyTestnet: {
      basePath: "m/44'/1'/0'",
      // eslint-disable-next-line quotes
      payload: { ins: [{ txId: "56a0553ef06a20e3f1ab5f44e9043ebeb21894e5954a11b7c328c2621133af4c", value: "1000", vout: 0, address: "n3zDsuecbBMg5yhiWJoWV4Y3hsQsdHzYq2", derivationPath: "0/0" }], outs: [{ recipient: "mrLMj5F96hQVfj9BJpGfkF6wSk9nAFY3Fs", isChange: false, value: "400", derivationPath: "" }, { recipient: "mt8YYwMb1jKi3oSJ4x1QFwqkHDaaBKu5HG", isChange: true, value: "100", derivationPath: "1/0" }] },
      signTxUseCase: makeBTCLegacyTestnetUseCase()
    },

    ethTestnet: {
      basePath: "m/44'/1'/0'",
      payload: process.env.RAW_TX,
      signTxUseCase: makeETHTestnetUseCase()
    }
  }

  if (!options[option]) {
    throw new Error(`Invalid option: ${option}`)
  }

  return options[option]
}

function makeBTCSegWitTestnetUseCase () {
  const BTCSegWitSignTransactionStrategy = require('../core/src/domain/strategies/sign-transaction/btc-segwit-strategy')
  const BTCKeyRepository = require('../core/src/infra/repositories/btc-key-repository')

  const btcSegWitSignStrategy = new BTCSegWitSignTransactionStrategy({
    keyRepository: new BTCKeyRepository({ keyToMnemonic })
  })

  return new SignTransactionUseCase({
    protocolStrategy: btcSegWitSignStrategy
  })
}

function makeBTCLegacyTestnetUseCase () {
  const BTCLegacySignTransactionStrategy = require('../core/src/domain/strategies/sign-transaction/btc-legacy-strategy')
  const BTCKeyRepository = require('../core/src/infra/repositories/btc-key-repository')

  const btcSegWitSignStrategy = new BTCLegacySignTransactionStrategy({
    keyRepository: new BTCKeyRepository({ keyToMnemonic })
  })

  return new SignTransactionUseCase({
    protocolStrategy: btcSegWitSignStrategy
  })
}
function makeETHTestnetUseCase ({ gapLimit = {} } = {}) {
  const EVMSignTransactionStrategy = require('../core/src/domain/strategies/sign-transaction/evm-strategy')

  const EVMKeyRepository = require('../core/src/infra/repositories/evm-key-repository')

  const evmKeyRepositoryTestnet = new EVMKeyRepository({ keyToMnemonic })

  const evmSignStrategy = new EVMSignTransactionStrategy({
    keyRepository: evmKeyRepositoryTestnet
  })

  return new SignTransactionUseCase({
    protocolStrategy: evmSignStrategy
  })
}
