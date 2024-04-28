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

  // TODO: refactor
  // Currently, this is a "minimal to make it work" implementation
  async initTransaction ({ keyName, basePath, recipient, amount, customChangeAddress }) {
    const utxos = await this.discoverUTXOs({ keyName, basePath })
    const { selectedUTXOs, fee } = this.selectUTXOs(amount, utxos)

    const changeAddress = customChangeAddress ||
      await this.discoverChangeAddress({ keyName, basePath })

    console.log({ fee, selectedUTXOs, changeAddress })

    const unsignedTx = this.createSegwitPSBT({
      amount,
      changeAddress,
      recipientAddress: recipient,
      selectedUTXOs
    })

    return {
      unsignedTx: unsignedTx.toHex()
    }
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
    selectedUTXOs.forEach(async utxo => {
      const txHex = await this.blockchainAPI.getHexTx(utxo.txid)

      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        nonWitnessUtxo: Buffer.from(txHex, 'hex')
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
            masterFingerprint: utxo.masterFingerprint,
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

    // Calculate total input amount
    const totalInput = selectedUTXOs.reduce((sum, utxo) => sum + utxo.value, 0)
    // Calculate change
    const fee = this.calculateFee(selectedUTXOs.length, 2)
    const change = totalInput - amount - fee

    if (change > 0) {
      // Change output
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

    const masterFingerprint = this.keyRepository.getMasterFingerprint({ keyName })

    const customUTXOs = utxos.map(({ address, path, publicKey, utxos }) => {
      return utxos.map(utxo => {
        return {
          address,
          path,
          publicKey,
          // masterFingerprint,
          masterFingerprint: Buffer.from(masterFingerprint, 'hex'),
          ...utxo
        }
      })
    }).flatMap(x => x)

    return customUTXOs
  }

  // TODO: Validate basePath
  async discoverChangeAddress ({ keyName, basePath }) {
    let addressIndex = 0
    let accountFound = false
    console.log('starting change address discovery')

    while (!accountFound) {
      // BIP44 standard: m / purpose' / coin_type' / account' / change / address_index
      // Base path means the first 4 parts of the path (m / purpose' / coin_type' / account')
      const path = `${basePath}/1/${addressIndex}`
      console.log(`trying path ${path}`)
      addressIndex++

      const { address } = this.keyRepository.getKeyPair({ keyName, path })
      if (this.usedAddresses.has(address)) {
        console.log(`address ${address} already checked, skipping...`)
        continue
      }

      const transactions = await this.blockchainAPI.getTransactions(address)
      console.log(`address ${address} has ${transactions?.length} transactions`)
      if (transactions?.length > 0) {
        this.usedAddresses.set(address, transactions)
      } else {
        accountFound = true
      }
    }

    console.log(`change address found at address_index ${addressIndex - 1}`)
    return this.keyRepository.getKeyPair({
      keyName,
      path: `${basePath}/1/${addressIndex - 1}`
    }).address
  }
}
