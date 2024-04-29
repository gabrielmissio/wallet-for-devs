// Currently, this class implements "Etherscan" API
module.exports = class EVMBlockchainAPI {
  constructor ({ httpClient }) {
    this.httpClient = httpClient
  }

  async getTransactions (address) {
    const apiKey = process.env.ETHERSCAN_API_KEY

    const fetchResult = await this.httpClient.fetch(
      `/?module=account&action=txlist&address=${address}&apikey=${apiKey}`
    )
    if (fetchResult.status !== 200) {
      throw new Error('Error fetching transactions')
    }

    return fetchResult.body.result
  }

  async getBalance (address) {
    const apiKey = process.env.ETHERSCAN_API_KEY

    const fetchResult = await this.httpClient.fetch(
      `/?module=account&action=balance&address=${address}&apikey=${apiKey}`
    )
    if (fetchResult.status !== 200) {
      throw new Error('Error fetching balance')
    }

    const balance = fetchResult.body.result / 1e18
    return { balance }
  }

  async broadcastTransaction (signedTx) {
    const endpoint = 'tx'
    const txId = await this.httpClient.fetch(endpoint, {
      method: 'POST',
      body: signedTx
    })

    return { txId }
  }
}
