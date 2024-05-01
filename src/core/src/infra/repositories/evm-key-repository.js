const { ethers } = require('ethers')

module.exports = class EVMKeyRepository {
  constructor ({ keyToMnemonic } = {}) {
    this.keyToMnemonic = keyToMnemonic

    if (!(keyToMnemonic instanceof Map)) {
      throw new Error('keyToMnemonic must be an instance of Map')
    }
  }

  getKeyPair ({ keyName, password = '', path = "m/44'/60'/0'/0/0" }) {
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

  exportReadOnlyKey ({ keyName, password = '', path = "m/84'/0'/0'" }) {
    const { publicKey } = this.getKeyPair({ keyName, password, path })

    return {
      protocol: 'eth',
      publicKey
    }
  }

  async signTransaction ({ keyName, path: basePath, unsignedTx }) {
    const path = `${basePath}/0/0` // TODO: get derivation path dynamically
    const { privateKey } = this.getKeyPair({ keyName, path })

    const wallet = new ethers.Wallet(privateKey)
    const signedTx = await wallet.signTransaction(unsignedTx)

    return signedTx
  }
}
