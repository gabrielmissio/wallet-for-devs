const { BIP32Factory } = require('bip32')
const bitcoin = require('bitcoinjs-lib')
const bs58check = require('bs58check')
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

  // BTC SegWit, default keyPair option
  getKeyPair ({ keyName, path = "m/84'/0'/0'/0/0" }) {
    const wallet = this.loadMasterKey(keyName)
    const node = wallet.derivePath(path)

    const btcAddress = bitcoin.payments.p2wpkh({
      pubkey: node.publicKey,
      network: bitcoin.networks[this.network]
    }).address

    return {
      privateKey: node.privateKey,
      publicKey: node.publicKey,
      address: btcAddress
    }
  }

  getLegacyKeyPair ({ keyName, path = "m/44'/0'/0'/0/0" }) {
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

  exportReadOnlyKey ({ keyName, path = "m/84'/0'/0'" }) {
    console.log({ keyName, path })
    // get procol by proposal path(84 btc_segwit, 44 btc legacy)
    let outputFormat
    const protocol = path.split('/')[1] === "84'" ? 'btc_segwit' : 'btc_legacy'
    if (protocol === 'btc_segwit') {
      outputFormat = this.network === 'bitcoin' ? 'zpub' : 'vpub'
    } else {
      outputFormat = this.network === 'bitcoin' ? 'xpub' : 'tpub'
    }

    const wallet = this.loadMasterKey(keyName)
    const node = wallet.derivePath(path)

    const xPubKey = node.neutered().toBase58()
    console.log({ xPubKey })

    const converted = convertXKey(xPubKey, outputFormat)
    console.log({ converted })

    const masterPublicKey = node.publicKey
    const masterFingerprint = bitcoin.crypto.hash160(masterPublicKey).slice(0, 4)

    const result = {
      protocol,
      publicKey: converted,
      fingerprint: masterFingerprint.toString('hex')
    }

    console.log(result)
    return result
  }
}

function convertXKey (xpub, target) {
  const PREFIXES = {
    tpub: '043587CF',
    vpub: '045f1cf6',
    zpub: '04b24746',
    tprv: '04358394',
    vprv: '045f18bc',
    zprv: '04b2430c'
  }
  if (!PREFIXES[target]) return xpub
  const unprefixed = Buffer.from(bs58check.decode(xpub).slice(4))
  const converted = Buffer.concat([
    Buffer.from(PREFIXES[target], 'hex'),
    unprefixed
  ])
  return bs58check.encode(converted)
}
