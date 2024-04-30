module.exports = class EVMSignStrategy {
  constructor ({ keyRepository }) {
    this.keyRepository = keyRepository
  }

  async signTransaction ({ keyName, path, payload }) {
    const signedTx = await this.keyRepository.signTransaction({ keyName, path, unsignedTx: payload })

    return { signedTx }
  }
}
