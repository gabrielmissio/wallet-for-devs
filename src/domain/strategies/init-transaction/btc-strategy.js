const bitcoin = require('bitcoinjs-lib')

module.exports = class BTCInitTxStrategy {
  constructor ({
    blockchainAPI,
    keyRepository,
    gapLimit = 5,
    feePerByte = 1,
    network = bitcoin.networks.testnet
  }) {
    this.blockchainAPI = blockchainAPI
    this.keyRepository = keyRepository
    this.feePerByte = feePerByte
    this.gapLimit = gapLimit
    this.network = network

    // TODO: review if you really need this
    this.usedAddresses = new Map()
  }

  calculateFee (numInputs, numOutputs) {
    const txSize = numInputs * 180 + numOutputs * 34 + 10 // rough estimation of transaction size in bytes
    return txSize * this.feePerByte
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
      const a = bitcoin.payments.p2wpkh({
        pubkey: utxo.publicKey,
        network: this.network
      })

      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          script: a.output,
          value: parseInt(utxo.value, 10)
        },
        bip32Derivation: [
          {
            pubkey: utxo.publicKey,
            path: utxo.path
          }
        ]
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

  selectUTXOs (totalAmount, utxos) {
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

  async discoverUTXOs ({ keyName, basePath }) {
    const promises = []
    let addressIndex = 0
    let consecutiveEmptyAddresses = 0
    console.log('starting account balance discovery')

    let changeAccountFound = false

    while (consecutiveEmptyAddresses < this.gapLimit || !changeAccountFound) {
      const paymentPath = `${basePath}/0/${addressIndex}`
      const changePath = `${basePath}/1/${addressIndex}`
      addressIndex++

      // payment address
      if (consecutiveEmptyAddresses < this.gapLimit) {
        console.log(`trying payment path ${paymentPath}`)
        const { address: paymentAddress, publicKey } = this.keyRepository.getKeyPair({ keyName, path: paymentPath })
        if (this.usedAddresses.has(paymentAddress)) {
          console.log(`address ${paymentAddress} already checked, skipping...`)
          consecutiveEmptyAddresses = 0 // Reset on finding a used address
          promises.push(
            this.blockchainAPI.getUTXOs(paymentAddress).then((utxos) => ({ address: paymentAddress, path: paymentPath, publicKey, utxos }))
          )
        } else {
          const transactions = await this.blockchainAPI.getTransactions(paymentAddress)
          console.log(`address ${paymentAddress} has ${transactions?.length} transactions`)
          if (transactions?.length > 0) {
            this.usedAddresses.set(paymentAddress, transactions)
            consecutiveEmptyAddresses = 0 // Reset on finding a used address
            promises.push(
              this.blockchainAPI.getUTXOs(paymentAddress).then((utxos) => ({ address: paymentAddress, path: paymentPath, publicKey, utxos }))
            )
          } else {
            consecutiveEmptyAddresses++
          }
        }
      }

      // change address
      if (!changeAccountFound) {
        console.log(`trying change path ${changePath}`)
        const { address: changeAddress, publicKey } = this.keyRepository.getKeyPair({ keyName, path: changePath })
        if (this.usedAddresses.has(changeAddress)) {
          console.log(`address ${changeAddress} already checked, skipping...`)
          promises.push(
            this.blockchainAPI.getUTXOs(changeAddress).then((utxos) => ({ address: changeAddress, path: paymentPath, publicKey, utxos }))
          )
        } else {
          const transactions = await this.blockchainAPI.getTransactions(changeAddress)
          console.log(`address ${changeAddress} has ${transactions?.length} transactions`)
          if (transactions?.length > 0) {
            this.usedAddresses.set(changeAddress, transactions)
            promises.push(
              this.blockchainAPI.getUTXOs(changeAddress).then((utxos) => ({ address: changeAddress, path: paymentPath, publicKey, utxos }))
            )
          } else {
            changeAccountFound = true
          }
        }
      }

      console.log(`consecutiveEmptyAddresses: ${consecutiveEmptyAddresses}`)
    }

    const utxos = await Promise.all(promises)
    console.log(`total balance found: ${utxos.length}`)
    console.log({ utxos })

    const customUTXOs = utxos.map(({ address, path, publicKey, utxos }) => {
      return utxos.map(utxo => {
        return {
          address,
          path,
          publicKey,
          ...utxo
        }
      })
    }).flatMap(x => x)

    return customUTXOs
  }
}
