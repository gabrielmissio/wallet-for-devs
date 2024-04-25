const bitcoin = require('bitcoinjs-lib')

module.exports = class BTCInitTxStrategy {
  constructor ({ blockchainAPI, feePerByte = 1, network = bitcoin.networks.testnet }) {
    this.blockchainAPI = blockchainAPI
    this.feePerByte = feePerByte
    this.network = network
  }

  calculateFee (numInputs, numOutputs) {
    const txSize = numInputs * 180 + numOutputs * 34 + 10 // rough estimation of transaction size in bytes
    return txSize * this.feePerByte
  }

  async selectUTXOs (totalAmount, address) {
    // TODO: Should look for UTXOs in multiple addresses
    const utxos = await this.blockchainAPI.getUTXOs(address)
    utxos.sort((a, b) => b.amount - a.amount)

    const selectedUTXOs = []
    let selectedAmount = 0
    let i = 0

    while (selectedAmount < totalAmount && i < utxos.length) {
      selectedUTXOs.push(utxos[i])
      selectedAmount += utxos[i].amount
      i++
    }

    // TODO: Stop assuming...
    let fee = this.calculateFee(selectedUTXOs.length, 2) // Assuming 2 outputs (recipient + change)
    totalAmount += fee

    while (selectedAmount < totalAmount && i < utxos.length) {
      selectedUTXOs.push(utxos[i])
      selectedAmount += utxos[i].amount
      i++
      const newFee = this.calculateFee(selectedUTXOs.length, 2)
      totalAmount = totalAmount - fee + newFee
      fee = newFee
    }

    if (selectedAmount < totalAmount) {
      throw new Error('Insufficient funds for transaction.')
    }

    return { selectedUTXOs, fee }
  }

  // TODO: create "generic shared method name" to use across different strategies
  // TODO: should use derivation path to choose between legacy and segwit
  // TODO: should use derivation path to choose change address (does not not if should do it here or in another layer)

  createLegacyPSBT ({ recipientAddress, amount, selectedUTXOs, changeAddress }) {
    const psbt = new bitcoin.Psbt({ network: this.network })
    selectedUTXOs.forEach(utxo => {
      psbt.addInput({
        hash: utxo.txId,
        index: utxo.vout,
        nonWitnessUtxo: Buffer.from(utxo.rawTransaction, 'hex')
      })
    })

    // Recipient output
    psbt.addOutput({
      address: recipientAddress,
      value: amount
    })

    // Change output
    const change = selectedUTXOs.reduce((sum, utxo) => sum + utxo.amount, 0) - amount - this.calculateFee(selectedUTXOs.length, 2)
    if (change > 0) {
      psbt.addOutput({
        address: changeAddress,
        value: change
      })
    }

    return psbt
  }

  createSegwitPSBT ({ recipientAddress, amount, selectedUTXOs, changeAddress }) {
    const psbt = new bitcoin.Psbt({ network: this.network })
    selectedUTXOs.forEach(utxo => {
      psbt.addInput({
        hash: utxo.txId,
        index: utxo.vout,
        witnessUtxo: {
          script: Buffer.from(utxo.scriptPubKey, 'hex'), // current "BtcAPI" does not return scriptPubKey
          value: utxo.amount
        }
      })
    })

    // Recipient output
    psbt.addOutput({
      address: recipientAddress,
      value: amount
    })

    // Change output
    const change = selectedUTXOs.reduce((sum, utxo) => sum + utxo.amount, 0) - amount - this.calculateFee(selectedUTXOs.length, 2)
    if (change > 0) {
      psbt.addOutput({
        address: changeAddress,
        value: change
      })
    }

    return psbt
  }
}
