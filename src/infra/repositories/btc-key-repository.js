const { BIP32Factory } = require('bip32')
const bitcoin = require('bitcoinjs-lib')
const { ECPairFactory } = require('ecpair')
const tinysecp = require('tiny-secp256k1')
const bs58check = require('bs58check')
const ecc = require('tiny-secp256k1')
const bip32 = BIP32Factory(ecc)
const { ethers } = require('ethers')

const { mnemonicToSeed } = require('../helpers/key-helper')

const ECPair = ECPairFactory(tinysecp)
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

    const protocol = getProtocol(path)
    const format = protocol === 'btc_segwit' ? 'p2wpkh' : 'p2pkh'

    const btcAddress = bitcoin.payments[format]({
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
    let outputFormat
    const protocol = getProtocol(path)

    if (protocol === 'btc_segwit') {
      outputFormat = this.network === 'bitcoin' ? 'zpub' : 'vpub'
    } else {
      outputFormat = this.network === 'bitcoin' ? 'xpub' : 'tpub'
    }

    const wallet = this.loadMasterKey(keyName)
    const node = wallet.derivePath(path)

    const xPubKey = node.neutered().toBase58()
    const converted = convertXKey(xPubKey, outputFormat)
    console.log({ xPubKey, converted })

    const masterPublicKey = wallet.publicKey
    const masterFingerprint = bitcoin.crypto.hash160(masterPublicKey).slice(0, 4)
    const masterFingerprint2 = ethers.ripemd160(ethers.sha256(masterPublicKey))
      .replace('0x', '')
      .slice(0, 8)

    console.log({
      masterFingerprint,
      masterFingerprint2,
      masterFingerprintHex: masterFingerprint.toString('hex'),
      masterFingerprint2Hex: masterFingerprint2.toString('hex')
    })

    const result = {
      protocol,
      publicKey: xPubKey,
      masterFingerprint: masterFingerprint2
    }

    return result
  }

  async signTransaction ({ keyName, psbt }) {
    const wallet = this.loadMasterKey(keyName)

    // move to strategy
    const keySignerMap = new Map()
    // Avoid creating derived keys for the same path multiple times

    for (const [index, input] of psbt.data.inputs.entries()) {
      const { path } = input.bip32Derivation[0]
      console.log({ path })
      const signKeyName = `${keyName}-${path}`

      let signer = keySignerMap.get(signKeyName)
      if (!signer) {
        const privKey = wallet.derivePath(path).privateKey
        signer = ECPair.fromPrivateKey(privKey, { network: bitcoin.networks[this.network] })
        console.log({ signer })
        keySignerMap.set(signKeyName, signer)
      }
      await psbt.signInputAsync(index, signer)
    }

    const signedTx = psbt.toHex()

    return { signedTx }
  }

  logInfo ({ keyName }) {
    const wallet = this.loadMasterKey(keyName)
    const master = wallet // wallet.derivePath(path)

    // Get BIP32 extended private key
    const xprivMaster = master.toBase58()
    const privKeyMaster = master.privateKey.toString('hex')
    // Get private key WIF
    const wifMaster = master.toWIF()
    // Get BIP32 extended master public key
    const xpubMaster = master.neutered().toBase58()
    // Get master public key
    const pubKeyMaster = master.publicKey.toString('hex')
    // Get master public key fingerprint
    const pubKeyFingerprintMaster = bitcoin.crypto.hash160(master.publicKey).slice(0, 4).toString('hex')
    console.log(`${Object.keys(wallet)}`, pubKeyFingerprintMaster)

    return {
      xprivMaster: `${xprivMaster}`,
      privKeyMaster: `${privKeyMaster}`,
      wifMaster: `${wifMaster}`,
      xpubMaster: `${xpubMaster}`,
      pubKeyMaster: `${pubKeyMaster}`,
      pubKeyFingerprintMaster: `${pubKeyFingerprintMaster}`
    }
  }
}

function getProtocol (path) {
  return path.split('/')[1] === "84'" ? 'btc_segwit' : 'btc_legacy'
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
