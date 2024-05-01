const qrcode = require('qrcode-terminal')

require('dotenv').config()
const ExportAccountUseCase = require('../core/src/domain/use-cases/export-account-use-case')

const keyName = 'any-key-alias'
const keyToMnemonic = new Map()
keyToMnemonic.set(keyName, process.env.DEVELOPMENT_MNEMONIC)

// const btcSegWitTestnetBasePath = "m/84'/1'/0'"
const btcSLegacyTestnetBasePath = "m/44'/1'/0'"

const exportAccountUseCase = makeUseCase('eth')

exportAccountUseCase.exportReadOnlyAccount({
  keyName, path: btcSLegacyTestnetBasePath
}).then((data) => {
  qrcode.generate(data.qrCodeData, { small: true })
})

function makeUseCase (option) {
  switch (option) {
    case 'btc':
      return makeBTCTestnetUseCase()
    case 'eth':
      return makeETHTestnetUseCase()
    default:
      throw new Error('Invalid option')
  }
}

function makeBTCTestnetUseCase () {
  const BTCKeyRepository = require('../core/src/infra/repositories/btc-key-repository')

  return new ExportAccountUseCase({
    keyRepository: new BTCKeyRepository({ keyToMnemonic })
  })
}

function makeETHTestnetUseCase () {
  const EVMKeyRepository = require('../core/src/infra/repositories/evm-key-repository')

  return new ExportAccountUseCase({
    keyRepository: new EVMKeyRepository({ keyToMnemonic })
  })
}
