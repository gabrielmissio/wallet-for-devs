// Currently, this class implements "mempool.space" API
module.exports = class BTCBlockchainAPI {
  constructor ({ httpClient }) {
    this.httpClient = httpClient
  }

  async getTransactions (address) {
    const endpoint = `address/${address}/txs`
    const transactions = await this.httpClient.fetch(endpoint)

    return transactions
  }

  async getBalance (address) {
    console.log(`starting a new request at ${new Date()} to get balance for address ${address}`)
    const endpoint = `address/${address}/utxo`
    const utxos = await this.httpClient.fetch(endpoint)
    const balance = utxos.reduce((acc, { value }) => acc + value, 0)

    return { balance }
  }

  async broadcastTransaction (signedTx) {
    const endpoint = 'tx'
    const txId = await this.httpClient.fetch(endpoint, {
      method: 'POST',
      body: signedTx
    })

    return txId
  }
}
