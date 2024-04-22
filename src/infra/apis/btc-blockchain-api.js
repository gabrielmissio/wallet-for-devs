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

  // Not so simple as it seems
  async broadcastTransaction (signedTx) {
    const endpoint = 'tx'
    const response = await this.httpClient.fetch(endpoint, {
      method: 'POST',
      body: signedTx
    })

    return response
  }
}
