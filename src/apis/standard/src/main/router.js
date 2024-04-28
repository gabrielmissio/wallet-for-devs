const express = require('express')
const validatorMiddleware = require('./middlewares/validator')
const walletMiddleware = require('./middlewares/wallet')
const controller = require('./../presentation/controllers')
const schemas = require('./../presentation/validators')

const router = express.Router()

router.post('/start', validatorMiddleware(schemas.startWallet), controller.startWallet)

router.post('/broadcast-transaction', validatorMiddleware(schemas.broadcastTransaction), controller.broadcastTransaction)

// This middleware ensures that the wallet is initialized
// All routes below this middleware require the wallet to be initialized
router.use(walletMiddleware)

router.post('/stop', validatorMiddleware(schemas.stopWallet), controller.stopWallet)

router.get('/discover-empty-account', validatorMiddleware(schemas.discoverEmptyAccount), controller.discoverEmptyAccount)

router.get('/discover-current-address', validatorMiddleware(schemas.discoverNextPaymentAddress), controller.discoverNextPaymentAddress)

router.get('/discover-account-balance', validatorMiddleware(schemas.discoverAccountBalance), controller.discoverAccountBalance)

router.post('/init-transaction', validatorMiddleware(schemas.initTransaction), controller.initTransaction)

router.post('/sign-transaction', validatorMiddleware(schemas.signTransaction), controller.signTransaction)

router.post('/simple-send-transaction', validatorMiddleware(schemas.simpleSendTransaction), controller.simpleSendTransaction)

module.exports = router
