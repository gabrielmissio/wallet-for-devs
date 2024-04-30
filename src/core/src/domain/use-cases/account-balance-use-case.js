module.exports = class AccountBalanceUseCase {
  constructor ({ blockchainAPI, keyRepository, gapLimit, useChangePath = true }) {
    this.blockchainAPI = blockchainAPI
    this.keyRepository = keyRepository
    this.gapLimit = gapLimit
    this.useChangePath = useChangePath

    // TODO: review if you really need this
    this.usedAddresses = new Map()
  }

  // BIP44 standard: m / purpose' / coin_type' / account' / change / address_index
  // Base path means the first 4 parts of the path (m / purpose' / coin_type' / account')
  async discoverAccountBalance ({ keyName, basePath }) {
    const promises = []
    let addressIndex = 0
    let consecutiveEmptyAddresses = 0
    console.log('starting account balance discovery')

    let changeAccountFound = !this.useChangePath // if useChangePath is false, we don't need to find a change account

    while (consecutiveEmptyAddresses < this.gapLimit || !changeAccountFound) {
      const paymentPath = `${basePath}/0/${addressIndex}`
      const changePath = `${basePath}/1/${addressIndex}`
      addressIndex++

      // payment address
      if (consecutiveEmptyAddresses < this.gapLimit) {
        console.log(`trying payment path ${paymentPath}`)
        const { address: paymentAddress } = this.keyRepository.getKeyPair({ keyName, path: paymentPath })
        if (this.usedAddresses.has(paymentAddress)) {
          console.log(`address ${paymentAddress} already checked, skipping...`)
          consecutiveEmptyAddresses = 0 // Reset on finding a used address
          promises.push(
            this.blockchainAPI.getBalance(paymentAddress).then(({ balance }) => ({ address: paymentAddress, path: paymentPath, balance }))
          )
        } else {
          const transactions = await this.blockchainAPI.getTransactions(paymentAddress)
          console.log(`address ${paymentAddress} has ${transactions?.length} transactions`)
          if (transactions?.length > 0) {
            this.usedAddresses.set(paymentAddress, transactions)
            consecutiveEmptyAddresses = 0 // Reset on finding a used address
            promises.push(
              this.blockchainAPI.getBalance(paymentAddress).then(({ balance }) => ({ address: paymentAddress, path: paymentPath, balance }))
            )
          } else {
            consecutiveEmptyAddresses++
            promises.push(
              Promise.resolve({ address: paymentAddress, path: paymentPath, balance: 0 })
            )
          }
        }
      }

      // change address
      if (!changeAccountFound) {
        console.log(`trying change path ${changePath}`)
        const { address: changeAddress } = this.keyRepository.getKeyPair({ keyName, path: changePath })
        if (this.usedAddresses.has(changeAddress)) {
          console.log(`address ${changeAddress} already checked, skipping...`)
          promises.push(
            this.blockchainAPI.getBalance(changeAddress).then(({ balance }) => ({ address: changeAddress, path: changePath, balance }))
          )
        } else {
          const transactions = await this.blockchainAPI.getTransactions(changeAddress)
          console.log(`address ${changeAddress} has ${transactions?.length} transactions`)
          if (transactions?.length > 0) {
            this.usedAddresses.set(changeAddress, transactions)
            promises.push(
              this.blockchainAPI.getBalance(changeAddress).then(({ balance }) => ({ address: changeAddress, path: changePath, balance }))
            )
          } else {
            changeAccountFound = true
            promises.push(
              Promise.resolve({ address: changeAddress, path: changePath, balance: 0 })
            )
          }
        }
      }

      console.log(`consecutiveEmptyAddresses: ${consecutiveEmptyAddresses}`)
    }

    const balances = await Promise.all(promises)
    const totalBalance = balances.reduce((acc, { balance }) => acc + balance, 0)
    console.log(`total balance found: ${totalBalance}`)

    return {
      balances,
      totalBalance
      // totalBalance: totalBalance / 1e8
    }
  }
}
