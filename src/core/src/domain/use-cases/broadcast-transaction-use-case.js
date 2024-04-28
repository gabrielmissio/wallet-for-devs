module.exports = class ExportAccountUseCase {
  constructor ({ blockchainAPI }) {
    this.blockchainAPI = blockchainAPI
  }

  async broadcastTransaction ({ signedTx }) {
    return this.blockchainAPI.broadcastTransaction(signedTx)
  }
}
