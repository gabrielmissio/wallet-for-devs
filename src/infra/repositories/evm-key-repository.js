const { ethers } = require('ethers')

module.exports = class EVMKeyRepository {
  constructor ({ keyToMnemonic } = {}) {
    this.keyToMnemonic = keyToMnemonic

    if (!(keyToMnemonic instanceof Map)) {
      throw new Error('keyToMnemonic must be an instance of Map')
    }
  }

  getKeyPair ({ keyName, password = '', path = "m/44'/0'/0'/0/0" }) {
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
