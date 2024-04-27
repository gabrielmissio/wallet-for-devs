const { networks, Psbt } = require('bitcoinjs-lib')

module.exports = class BTCSegWitSignStrategy {
  constructor ({ keyRepository, network = 'testnet' }) {
    this.keyRepository = keyRepository
    this.network = networks[network]
  }

  // TODO: validate inputs and change address
  async signTransaction ({ keyName, path, payload }) {
    const { publicKey } = this.keyRepository.exportReadOnlyKey({ keyName, path })
    const psbt = Psbt.fromHex(payload, { network: this.network })

    // Avoid creating derived keys for the same path multiple times
    const keySignerMap = new Map()

    for (const [index, input] of psbt.data.inputs.entries()) {
      const { path } = input.bip32Derivation[0]
      const signKeyName = `${keyName}-${path}`

      let signer = keySignerMap.get(signKeyName)
      if (!signer) {
        signer = this.keyRepository.getSigner({ keyName, path })
        keySignerMap.set(signKeyName, signer)
      }
      await psbt.signInputAsync(index, signer)
    }

    psbt.finalizeAllInputs()
    const signedTx = psbt.extractTransaction().toHex()

    return {
      publicKey,
      signedTx
    }
  }
}
