const qrcode = require('qrcode-terminal')

require('dotenv').config()
const BTCSegWitSignTransactionStrategy = require('./domain/strategies/sign-transaction/btc-segwit-strategy')
const SignTransactionUseCase = require('./domain/use-cases/sign-transaction-use-case')
const BTCKeyRepository = require('./infra/repositories/btc-key-repository')

const keyName = 'any-key-alias'
const keyToMnemonic = new Map()
keyToMnemonic.set(keyName, process.env.DEVELOPMENT_MNEMONIC)

const btcSegWitTestnetBasePath = "m/84'/0'/0'"

const btcSegWitSignStrategy = new BTCSegWitSignTransactionStrategy({
  keyRepository: new BTCKeyRepository({ keyToMnemonic })
})
const signTransactionUseCase = new SignTransactionUseCase({
  protocolStrategy: btcSegWitSignStrategy
})

signTransactionUseCase.signTransaction({
  keyName, path: btcSegWitTestnetBasePath, payload: process.env.RAW_TX
}).then((data) => {
  qrcode.generate(data.qrCodeData, { small: true })
  console.log(data.qrCodeData)
})
