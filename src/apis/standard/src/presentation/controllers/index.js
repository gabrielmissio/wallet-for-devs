const { initializedWallets } = require('../../domain/services/wallet-service')
const useCaseFactory = require('../../domain/factories/use-case-factory')

async function startWallet (req, res) {
  try {
    const { walletId, seed } = req.body
    if (initializedWallets.has(walletId)) {
      return res.status(400).json({ error: 'WALLET_ALREADY_INITIALIZED' })
    }

    initializedWallets.set(walletId, seed)

    return res.status(200).json({ message: 'WALLET_INITIALIZED' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' })
  }
}

async function stopWallet (req, res) {
  try {
    const walletId = req.headers['x-wallet-id']

    if (!initializedWallets.has(walletId)) {
      return res.status(400).json({ error: 'WALLET_NOT_INITIALIZED' })
    }

    initializedWallets.delete(walletId)

    return res.status(200).json({ message: 'WALLET_STOPPED' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' })
  }
}

async function discoverEmptyAccount (req, res) {
  try {
    const { protocol, useTestnet } = req.query
    const walletId = req.headers['x-wallet-id']

    const basePath = getDerivationPath({
      protocol, useTestnet
    })
    const useCase = useCaseFactory.makeUseCase({
      useCase: 'account-discovery', protocol, useTestnet
    })
    const result = await useCase.discoverFirstEmptyAccount({
      keyName: walletId, basePath
    })

    return res.status(200).json(result)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' })
  }
}

async function discoverNextPaymentAddress (req, res) {
  try {
    const { protocol, useTestnet } = req.query
    const walletId = req.headers['x-wallet-id']
    const account = req.headers['x-account-id']

    const basePath = getDerivationPath({
      protocol, account, useTestnet
    })
    const useCase = useCaseFactory.makeUseCase({
      useCase: 'address-discovery', protocol, useTestnet
    })
    const result = await useCase.discoverPaymentAddress({
      keyName: walletId, basePath
    })

    return res.status(200).json(result)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' })
  }
}

async function discoverAccountBalance (req, res) {
  try {
    const { protocol, useTestnet } = req.query
    const walletId = req.headers['x-wallet-id']
    const account = req.headers['x-account-id']

    const basePath = getDerivationPath({
      protocol, account, useTestnet
    })
    const useCase = useCaseFactory.makeUseCase({
      useCase: 'account-balance', protocol, useTestnet
    })
    const result = await useCase.discoverAccountBalance({
      keyName: walletId, basePath
    })

    return res.status(200).json(result)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' })
  }
}

async function initTransaction (req, res) {
  try {
    const { protocol, useTestnet, ...txData } = req.body
    const walletId = req.headers['x-wallet-id']
    const account = req.headers['x-account-id']

    const basePath = getDerivationPath({
      protocol, account, useTestnet
    })
    const useCase = useCaseFactory.makeUseCase({
      useCase: 'init-transaction', protocol, useTestnet
    })
    const result = await useCase.initTransaction({
      keyName: walletId, basePath, ...txData
    })

    return res.status(200).json(result)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' })
  }
}

async function signTransaction (req, res) {
  try {
    const { protocol, useTestnet, unsignedTx } = req.body
    const walletId = req.headers['x-wallet-id']
    const account = req.headers['x-account-id']

    const basePath = getDerivationPath({
      protocol, account, useTestnet
    })
    const useCase = useCaseFactory.makeUseCase({
      useCase: 'sign-transaction', protocol, useTestnet
    })
    const result = await useCase.signTransaction({
      keyName: walletId, basePath, payload: unsignedTx
    })

    return res.status(200).json(result)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' })
  }
}

async function broadcastTransaction (req, res) {
  try {
    const { protocol, useTestnet, signedTx } = req.body

    const useCase = useCaseFactory.makeUseCase({
      useCase: 'broadcast-transaction', protocol, useTestnet
    })
    const result = await useCase.broadcastTransaction({ signedTx })

    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' })
  }
}

async function simpleTransaction (req, res) {
  try {
    return res.status(200).json({ })
  } catch (error) {
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' })
  }
}

function getDerivationPath ({ protocol, account, useTestnet }) {
  const purpose = protocol === 'BTC_SEGWIT' ? 84 : 44
  const coinType = useTestnet ? 1 : 0 // Refactor when adding more coins

  if (account === undefined) {
    return `m/${purpose}'/${coinType}'`
  }

  return `m/${purpose}'/${coinType}'/${account}'`
}

module.exports = {
  startWallet,
  stopWallet,
  discoverEmptyAccount,
  discoverNextPaymentAddress,
  discoverAccountBalance,
  initTransaction,
  signTransaction,
  broadcastTransaction,
  simpleTransaction
}
