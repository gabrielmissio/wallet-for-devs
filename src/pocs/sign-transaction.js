const qrcode = require('qrcode-terminal')

require('dotenv').config()
const SignTransactionUseCase = require('../domain/use-cases/sign-transaction-use-case')

const keyName = 'any-key-alias'
const keyToMnemonic = new Map()
keyToMnemonic.set(keyName, process.env.DEVELOPMENT_MNEMONIC)

const btcSegWitTestnetBasePath = "m/84'/1'/0'"
// const btcLegacyTestnetBasePath = "m/44'/1'/0'"

const btcSegWitPayload = process.env.RAW_TX
// const btcLegacyPayload = { ins: [{ txId: '56a0553ef06a20e3f1ab5f44e9043ebeb21894e5954a11b7c328c2621133af4c', value: '1000', vout: 0, address: 'n3zDsuecbBMg5yhiWJoWV4Y3hsQsdHzYq2', derivationPath: '0/0' }, { txId: '37d147c3d3a6c57ff724b20845fee0b02af6db29701bddf127c94e852a78b4be', value: '500', vout: 0, address: 'n3zDsuecbBMg5yhiWJoWV4Y3hsQsdHzYq2', derivationPath: '0/0' }], outs: [{ recipient: 'mrLMj5F96hQVfj9BJpGfkF6wSk9nAFY3Fs', isChange: false, value: '700', derivationPath: '' }] }

const signTransactionUseCase = makeBTCSegWitTestnetUseCase()
// const signTransactionUseCase = makeBTCLegacyTestnetUseCase()

signTransactionUseCase.signTransaction({
  keyName, path: btcSegWitTestnetBasePath, payload: btcSegWitPayload
}).then((data) => {
  qrcode.generate(data.qrCodeData, { small: true })
  console.log(data.qrCodeData)
})

function makeBTCSegWitTestnetUseCase () {
  const BTCSegWitSignTransactionStrategy = require('../domain/strategies/sign-transaction/btc-segwit-strategy')
  const BTCKeyRepository = require('../infra/repositories/btc-key-repository')

  const btcSegWitSignStrategy = new BTCSegWitSignTransactionStrategy({
    keyRepository: new BTCKeyRepository({ keyToMnemonic })
  })

  return new SignTransactionUseCase({
    protocolStrategy: btcSegWitSignStrategy
  })
}

/*
function makeBTCLegacyTestnetUseCase () {
  const BTCLegacySignTransactionStrategy = require('../domain/strategies/sign-transaction/btc-legacy-strategy')
  const BTCKeyRepository = require('../infra/repositories/btc-key-repository')

  const btcSegWitSignStrategy = new BTCLegacySignTransactionStrategy({
    keyRepository: new BTCKeyRepository({ keyToMnemonic })
  })

  return new SignTransactionUseCase({
    protocolStrategy: btcSegWitSignStrategy
  })
}
*/
