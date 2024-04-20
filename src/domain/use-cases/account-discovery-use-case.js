module.exports = class AccountDiscoveryUseCase {
  constructor ({ blockchainAPI, keyRepository, gapLimit }) {
    this.blockchainAPI = blockchainAPI
    this.keyRepository = keyRepository
    this.gapLimit = gapLimit
  }

  async discoverFirstEmptyAccount ({ keyName, basePath }) {
    // BIP44 standard: m / purpose' / coin_type' / account' / change / address_index
    // Base path means the first 3 parts of the path (m / purpose' / coin_type')
    let accountIndex = 0
    let isEmptyAccount = false

    while (!isEmptyAccount) {
      const externalPath = `${basePath}/${accountIndex}'/0` // Path for external addresses
      const internalPath = `${basePath}/${accountIndex}'/1` // Path for internal addresses

      isEmptyAccount = await this.checkAccountActivity({ keyName, path: externalPath })
      if (isEmptyAccount) {
        isEmptyAccount = await this.checkAccountActivity({ keyName, path: internalPath })
      }

      if (!isEmptyAccount) {
        accountIndex++
      }
    }

    return {
      index: accountIndex,
      accountPath: `${basePath}/${accountIndex}'`
    }
  }

  async checkAccountActivity ({ keyName, path: basePath }) {
    let result = true
    for (let addressIndex = 0; addressIndex < this.gapLimit; addressIndex++) {
      const path = `${basePath}/${addressIndex}`
      console.log(`trying path ${path}`)

      const { address } = this.keyRepository.getKeyPair({ keyName, path })
      const transactions = await this.blockchainAPI.getTransactions(address)
      console.log(`address ${address} has ${transactions?.length} transactions`)
      if (transactions?.length > 0) {
        result = false
        break
      }
    }

    return result
  }
}
