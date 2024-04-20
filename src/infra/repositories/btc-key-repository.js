const { BIP32Factory } = require('bip32')
const bitcoin = require('bitcoinjs-lib')
const ecc = require('tiny-secp256k1')
const bip32 = BIP32Factory(ecc)

const { mnemonicToSeed } = require('../helpers/key-helper')

const defaultNetwork = 'testnet'

module.exports = class BTCKeyRepository {
  constructor ({ network = defaultNetwork, keyToMnemonic } = {}) {
    this.network = network
    this.keyToMnemonic = keyToMnemonic

    if (!(keyToMnemonic instanceof Map)) {
      throw new Error('keyToMnemonic must be an instance of Map')
    }
  }

  loadMasterKey (keyName) {
    if (!this.keyToMnemonic.has(keyName)) {
      throw new Error('Key not found')
    }

    const mnemonic = this.keyToMnemonic.get(keyName)
    const seed = mnemonicToSeed(mnemonic)

    return bip32.fromSeed(seed, bitcoin.networks[this.network])
  }

  getKeyPair (keyName, path = "m/44'/0'/0'/0/0") {
    const wallet = this.loadMasterKey(keyName)
    const node = wallet.derivePath(path)

    const btcAddress = bitcoin.payments.p2pkh({
      pubkey: node.publicKey,
      network: bitcoin.networks[this.network]
    }).address

    return {
      privateKey: node.privateKey,
      publicKey: node.publicKey,
      address: btcAddress
    }
  }
}
