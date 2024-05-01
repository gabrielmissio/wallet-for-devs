const { ethers } = require('ethers')
const { encode } = require('@ethereumjs/rlp')

module.exports = class EVMInitTxStrategy {
  constructor ({
    blockchainAPI, // TODO: Move "provider logic" to blockchainAPI
    keyRepository,
    gapLimit = 5,
    rcpURL
    // feePerByte = 1
  }) {
    this.blockchainAPI = blockchainAPI
    this.keyRepository = keyRepository
    // this.feePerByte = feePerByte
    this.gapLimit = gapLimit
    this.provider = new ethers.JsonRpcProvider(rcpURL)

    // TODO: review if you really need this
    // this.usedAddresses = new Map()
  }

  async initTransaction ({ keyName, basePath, recipient, amount }) {
    const path = `${basePath}/0/0` // TODO: get derivation path dynamically
    console.log({ path })
    const keyPair = this.keyRepository.getKeyPair({ keyName, path })

    const fromAddress = keyPair.address
    const nonce = await this.provider.getTransactionCount(fromAddress, 'latest') // Get current nonce
    const feeData = await this.provider.getFeeData()

    const tx = {
      chainId: 80002, // 11155111,
      nonce,
      data: '0x',
      to: recipient,
      value: amount,
      gasLimit: '21000',
      gasPrice: feeData.gasPrice,
      maxFeePerGas: feeData.maxFeePerGas,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
    }
    const params = [
      // chainID
      typeof tx.chainId === 'number' ? '0x' + tx.chainId.toString(16) : tx.chainId,
      parseToHex(tx.nonce),
      tx.maxPriorityFeePerGas, // parseToHex(tx.maxPriorityFeePerGas),
      tx.maxFeePerGas, // parseToHex(tx.maxFeePerGas),
      parseToHex(tx.gasLimit),
      tx.to,
      parseToHex(tx.value),
      parseToHex(tx.data),
      tx.accessList || []
    ]
    console.log('params', params)
    const unsignedTx = '0x02' + Buffer.from(encode(params)).toString('hex')
    // const signed = this.keyRepository.signTransaction({ keyName, path, unsignedRawTx })

    return { unsignedTx }
  }
}

function parseToHex (value) {
  if (
    value === null ||
    value === undefined
  ) {
    return '0x'
  }
  if (
    typeof value === 'number' ||
    typeof value === 'bigint'
  ) {
    value = value.toString()
  }
  if (value.startsWith('0x')) {
    value = value.slice(2)
  }
  if (value === '0' || value === '') {
    return '0x'
  }
  return '0x' + parseInt(value).toString(16)
}
