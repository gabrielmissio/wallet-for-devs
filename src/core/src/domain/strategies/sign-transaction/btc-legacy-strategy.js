const { Psbt, payments, networks } = require('bitcoinjs-lib')

module.exports = class BTCLegacySignStrategy {
  constructor ({ keyRepository, network = 'testnet' }) {
    this.keyRepository = keyRepository
    this.network = networks[network]
  }

  // TODO: validate inputs and change address
  async signTransaction ({ keyName, path: basePath, payload }) {
    const psbt1 = Psbt.fromHex(payload, { network: this.network })
    console.log('psbt1', psbt1)
    const psbt = new Psbt({ network: this.network })
    const { publicKey } = this.keyRepository.exportReadOnlyKey({ keyName, path: basePath })

    // Avoid creating derived keys for the same path multiple times
    const keySignerMap = new Map()

    payload.ins.forEach(input => {
      const [change, addressIndex] = input.derivationPath.split('/')
      const path = `${basePath}/${change}/${addressIndex}`
      const signKeyName = `${keyName}-${path}`

      let signer = keySignerMap.get(signKeyName)
      if (!signer) {
        signer = this.keyRepository.getSigner({ keyName, path })
        keySignerMap.set(signKeyName, signer)
      }

      const p2wpkh = payments.p2wpkh({
        pubkey: signer.publicKey,
        network: networks[this.network]
      })
      psbt.addInput({
        hash: input.txId,
        index: input.vout,
        witnessUtxo: {
          script: p2wpkh.output,
          value: Number(input.value)
        }
      })
    })

    payload.outs.forEach(output => {
      psbt.addOutput({
        address: output.recipient,
        value: Number(output.value)
      })
    })

    // Sign each input
    payload.ins.forEach((input, index) => {
      const [change, addressIndex] = input.derivationPath.split('/')
      const path = `${basePath}/${change}/${addressIndex}`
      const signKeyName = `${keyName}-${path}`

      psbt.signInput(index, keySignerMap.get(signKeyName))
    })

    psbt.finalizeAllInputs()
    const signedTx = psbt.extractTransaction().toHex()
    const legacyTxInfo = this._getLegacyTxData(payload)

    return {
      publicKey,
      signedTx,
      legacyTxInfo
    }
  }

  _getLegacyTxData (payload) {
    const totalIns = payload.ins.reduce(
      (acc, next) => acc + Number(next.value),
      0
    )
    const totalOuts = payload.outs.reduce(
      (acc, next) => acc + Number(next.value),
      0
    )
    const amount = payload.outs.reduce(
      (acc, next) => acc + (next.isChange ? 0 : Number(next.value)),
      0
    )
    const fee = totalIns - totalOuts
    const from = payload.ins[0].address
    const to = payload.outs.filter((out) => !out.isChange)[0].recipient

    // refactor this shit!
    return {
      amount: amount.toString(),
      fee: fee.toString(),
      from: [from],
      to: [to]
    }
  }
}
