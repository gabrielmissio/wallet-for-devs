const bip39 = require('bip39')

function generateMnemonic () {
  return bip39.generateMnemonic()
}

function validateMnemonic (mnemonic) {
  return bip39.validateMnemonic(mnemonic)
}

function mnemonicToSeed (mnemonic) {
  return bip39.mnemonicToSeedSync(mnemonic)
}

module.exports = {
  generateMnemonic,
  validateMnemonic,
  mnemonicToSeed
}
