const qrcode = require('qrcode-terminal')

require('dotenv').config()
const ExportAccountUseCase = require('../domain/use-cases/export-account-use-case')
const BTCKeyRepository = require('../infra/repositories/btc-key-repository')

const keyName = 'any-key-alias'
const keyToMnemonic = new Map()
keyToMnemonic.set(keyName, process.env.DEVELOPMENT_MNEMONIC)

const btcSegWitTestnetBasePath = "m/84'/0'/0'"

const exportAccountUseCase = new ExportAccountUseCase({
  keyRepository: new BTCKeyRepository({ keyToMnemonic })
})

exportAccountUseCase.exportReadOnlyAccount({ keyName, path: btcSegWitTestnetBasePath }).then((data) => {
  qrcode.generate(data.qrCodeData, { small: true })
})
