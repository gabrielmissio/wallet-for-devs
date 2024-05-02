/*
module.exports = class EVMBlockchainAPI {
  constructor ({ explorerClient, rpcClient, clientOption = 'etherscan' }) {
    this.explorerClient = explorerClient
    this.rpcClient = rpcClient
    this.clientOption = clientOption
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
    const fetchResult = await this.rpcClient.fetch('', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1
      })
    })
    if (fetchResult.status !== 200) {
      throw new Error('Error fetching balance')
    }
    if (fetchResult.body.error) {
      throw new Error(fetchResult.body.error.message)
    }

    return { balance: parseInt(fetchResult.body.result, 16) }
  }

  async broadcastTransaction (signedTx) {
    const fetchResult = await this.rpcClient.fetch('', {
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
*/

module.exports.EtherscanAPI = class EtherscanAPI {
  constructor ({ explorerClient, rpcClient }) {
    this.explorerClient = explorerClient
    this.rpcClient = rpcClient
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
    const fetchResult = await this.rpcClient.fetch('', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1
      })
    })
    if (fetchResult.status !== 200) {
      throw new Error('Error fetching balance')
    }
    if (fetchResult.body.error) {
      throw new Error(fetchResult.body.error.message)
    }

    return { balance: parseInt(fetchResult.body.result, 16) }
  }

  async broadcastTransaction (signedTx) {
    const fetchResult = await this.rpcClient.fetch('', {
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

module.exports.OkLinkAPI = class OkLinkAPI {
  constructor ({ explorerClient, rpcClient }) {
    this.explorerClient = explorerClient
    this.rpcClient = rpcClient
  }

  async getTransactions (address) {
    const apiKey = process.env.OKLINK_API_KEY

    const fetchResult = await this.explorerClient.fetch(
      `v5/explorer/address/address-summary?chainShortName=AMOY_TESTNET&address=${address}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Ok-Access-Key': apiKey
        }
      }
    )

    if (fetchResult.status !== 200) {
      throw new Error('Error fetching transactions')
    }

    return fetchResult.body.data
  }

  async getBalance (address) {
    const fetchResult = await this.rpcClient.fetch('', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (fetchResult.status !== 200) {
      throw new Error('Error fetching balance')
    }
    if (fetchResult.body.error) {
      throw new Error(fetchResult.body.error.message)
    }

    return { balance: parseInt(fetchResult.body.result, 16) }
  }

  async broadcastTransaction (signedTx) {
    const fetchResult = await this.rpcClient.fetch('', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [signedTx],
        id: 1
      }),
      headers: {
        'Content-Type': 'application/json'
      }
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
