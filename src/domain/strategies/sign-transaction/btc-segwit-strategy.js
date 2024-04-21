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

    const { signedTx } = await this.keyRepository.signTransaction({ psbt, keyName, path })

    return {
      publicKey,
      signedTx
    }
  }
}
