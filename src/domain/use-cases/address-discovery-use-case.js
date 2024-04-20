module.exports = class AddressDiscoveryUseCase {
  constructor ({ keyRepository, blockchainAPI, gapLimit }) {
    this.keyRepository = keyRepository
    this.blockchainAPI = blockchainAPI
    this.gapLimit = gapLimit

    // TODO: review you really need this
    this.usedAddresses = new Map()
  }

  // TODO: Validate basePath
  // TODO: Optimize this method to avoid unnecessary sequential requests
  async discoverPaymentAddress ({ keyName, basePath }) {
    let addressIndex = 0
    let consecutiveEmptyAddresses = 0
    console.log('starting payment address discovery')

    while (consecutiveEmptyAddresses < this.gapLimit) {
      // BIP44 standard: m / purpose' / coin_type' / account' / change / address_index
      // Base path means the first 4 parts of the path (m / purpose' / coin_type' / account')
      const path = `${basePath}/0/${addressIndex}`
      console.log(`trying path ${path}`)
      addressIndex++

      const { address } = this.keyRepository.getKeyPair({ keyName, path })
      if (this.usedAddresses.has(address)) {
        console.log(`address ${address} already checked, skipping...`)
        consecutiveEmptyAddresses = 0 // Reset on finding a used address
        continue
      }

      const transactions = await this.blockchainAPI.getTransactions(address)
      console.log(`address ${address} has ${transactions?.length} transactions`)
      if (transactions?.length > 0) {
        this.usedAddresses.set(address, transactions)
        consecutiveEmptyAddresses = 0 // Reset on finding a used address
      } else {
        consecutiveEmptyAddresses++
      }
      console.log(`consecutiveEmptyAddresses: ${consecutiveEmptyAddresses}`)
    }

    const discoveredAddressIndex = addressIndex - this.gapLimit
    console.log(`payment address found at address_index ${discoveredAddressIndex}`)

    return this.keyRepository.getKeyPair({
      keyName,
      path: `${basePath}/0/${discoveredAddressIndex}`
    })
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
    })
  }
}
