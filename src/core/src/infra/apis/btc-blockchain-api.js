// Currently, this class implements "mempool.space" API
module.exports = class BTCBlockchainAPI {
  constructor ({ httpClient }) {
    this.httpClient = httpClient
  }

  async getTransactions (address) {
    const endpoint = `address/${address}/txs`
    const { body: transactions } = await this.httpClient.fetch(endpoint)

    return transactions
  }

  async getBalance (address) {
    const endpoint = `address/${address}/utxo`
    const { body: utxos } = await this.httpClient.fetch(endpoint)
    const balance = utxos.reduce((acc, { value }) => acc + value, 0)

    return { balance }
  }

  async getHexTx (txId) {
    const endpoint = `tx/${txId}/hex`
    const { body: hexTx } = await this.httpClient.fetch(endpoint)

    return hexTx
  }

  async getUTXOs (address) {
    const endpoint = `address/${address}/utxo`
    const { body: utxos } = await this.httpClient.fetch(endpoint)

    return utxos
  }

  async broadcastTransaction (signedTx) {
    const endpoint = 'tx'
    const { body: txId } = await this.httpClient.fetch(endpoint, {
      method: 'POST',
      body: signedTx
    })

    return { txId }
  }
}
