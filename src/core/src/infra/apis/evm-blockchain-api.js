// Currently, this class implements "Etherscan" API
module.exports = class EVMBlockchainAPI {
  constructor ({ explorerClient, rcpClient }) {
    this.explorerClient = explorerClient
    this.rcpClient = rcpClient
  }

  async getTransactions (address) {
    const apiKey = process.env.ETHERSCAN_API_KEY

    const fetchResult = await this.explorerClient.fetch(
      `/?module=account&action=txlist&address=${address}&apikey=${apiKey}`
    )

    if (fetchResult.status !== 200) {
      throw new Error('Error fetching transactions')
    }
    if (fetchResult.body.message === 'NOTOK') {
      throw new Error(fetchResult.body.result)
    }
    // NOTE: Temporary workaround to avoid Etherscan API rate limit
    await new Promise(resolve => setTimeout(resolve, 250))

    return fetchResult.body.result
  }

  async getBalance (address) {
    const apiKey = process.env.ETHERSCAN_API_KEY

    const fetchResult = await this.explorerClient.fetch(
      `/?module=account&action=balance&address=${address}&apikey=${apiKey}`
    )
    if (fetchResult.status !== 200) {
      throw new Error('Error fetching balance')
    }
    if (fetchResult.body.message === 'NOTOK') {
      throw new Error(fetchResult.body.result)
    }
    // NOTE: Temporary workaround to avoid Etherscan API rate limit
    await new Promise(resolve => setTimeout(resolve, 250))

    const balance = fetchResult.body.result / 1e18
    return { balance }
  }

  async broadcastTransaction (signedTx) {
    const fetchResult = await this.rcpClient.fetch('', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [signedTx],
        id: 1
      })
    })
    if (fetchResult.status !== 200) {
      throw new Error('Error fetching balance')
    }
    if (fetchResult.body.error) {
      throw new Error(fetchResult.body.error.message)
    }

    return { txId: fetchResult.body.result }
  }
}
