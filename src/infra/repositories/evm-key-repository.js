const { ethers } = require('ethers')

module.exports = class EVMKeyRepository {
  constructor () {
    this.keyToMnemonic = new Map()
  }

  getKeyPair (keyName, password = '', path = "m/44'/0'/0'/0/0") {
    if (!this.keyToMnemonic.has(keyName)) {
      throw new Error('Key not found')
    }

    const mnemonic = this.keyToMnemonic.get(keyName)
    const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic, password, path)

    return {
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      address: wallet.address
    }
  }
}
