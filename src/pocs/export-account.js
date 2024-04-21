const qrcode = require('qrcode-terminal')

require('dotenv').config()
const ExportAccountUseCase = require('../domain/use-cases/export-account-use-case')

const keyName = 'any-key-alias'
const keyToMnemonic = new Map()
keyToMnemonic.set(keyName, process.env.DEVELOPMENT_MNEMONIC)

// const btcSegWitTestnetBasePath = "m/84'/1'/0'"
const btcSLegacyTestnetBasePath = "m/44'/1'/0'"

const exportAccountUseCase = makeBTCTestnetUseCase()

exportAccountUseCase.exportReadOnlyAccount({
  keyName, path: btcSLegacyTestnetBasePath
}).then((data) => {
  qrcode.generate(data.qrCodeData, { small: true })
})

function makeBTCTestnetUseCase () {
  const BTCKeyRepository = require('../infra/repositories/btc-key-repository')

  return new ExportAccountUseCase({
    keyRepository: new BTCKeyRepository({ keyToMnemonic })
  })
}
