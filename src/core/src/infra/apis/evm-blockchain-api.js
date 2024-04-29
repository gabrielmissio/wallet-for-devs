// Currently, this class implements "Etherscan" API
module.exports = class EVMBlockchainAPI {
  constructor ({ httpClient }) {
    this.httpClient = httpClient
  }

  async getTransactions (address) {
    const apiKey = process.env.ETHERSCAN_API_KEY

    // TODO: Validate http code and explorer codes
    const fetchResult = await this.httpClient.fetch(
      `/?module=account&action=txlist&address=${address}&apikey=${apiKey}`
    )
    console.log(fetchResult.status)

    if (fetchResult.status !== 200) {
      throw new Error('Error fetching transactions')
    }
    // check if result is an array

    return fetchResult.body.result
  }

  async getBalance (address) {
    const apiKey = process.env.ETHERSCAN_API_KEY

    // TODO: Validate http code and explorer codes
    const fetchResult = await this.httpClient.fetch(
      `/?module=account&action=balance&address=${address}&apikey=${apiKey}`
    )
    console.log(fetchResult.status)

    if (fetchResult.status !== 200) {
      throw new Error('Error fetching transactions')
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
