const { initializedWallets } = require('../../domain/services/wallet-service')

module.exports = (req, res, next) => {
  const walletId = req.headers['x-wallet-id']

  if (walletId && !initializedWallets.has(walletId)) {
    return res.status(400).json({
      error: 'WALLET_NOT_INITIALIZED',
      details: `Wallet with ID ${walletId} is not initialized.`
    })
  }

  next()
}
