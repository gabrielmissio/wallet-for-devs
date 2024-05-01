const Joi = require('joi')

const allowedProtocols = ['BTC_SEGWIT', 'BNB', 'ETH', 'MATIC']

exports.startWallet = Joi.object({
  body: Joi.object({
    walletId: Joi.string().required(),
    seed: Joi.string().required()
    // passphrase: Joi.string(),
    // gapLimit: Joi.number(),
    // xpubkey: Joi.string()
  }).required()
}).unknown()

exports.stopWallet = Joi.object({
  headers: Joi.object({
    'x-wallet-id': Joi.string().required()
  }).unknown()
}).unknown()

exports.discoverEmptyAccount = Joi.object({
  query: Joi.object({
    protocol: Joi.string().valid(...allowedProtocols).required(),
    useTestnet: Joi.boolean().default(true)
  }).required(),
  headers: Joi.object({
    'x-wallet-id': Joi.string().required()
  }).unknown()
}).unknown()

exports.discoverNextPaymentAddress = Joi.object({
  query: Joi.object({
    protocol: Joi.string().valid(...allowedProtocols).required(),
    useTestnet: Joi.boolean().default(true)
  }).required(),
  headers: Joi.object({
    'x-wallet-id': Joi.string().required(),
    'x-account-id': Joi.number().default(0)
  }).unknown()
}).unknown()

exports.discoverAccountBalance = Joi.object({
  query: Joi.object({
    protocol: Joi.string().valid(...allowedProtocols).required(),
    useTestnet: Joi.boolean().default(true)
  }).required(),
  headers: Joi.object({
    'x-wallet-id': Joi.string().required(),
    'x-account-id': Joi.number().default(0)
  }).unknown()
}).unknown()

exports.initTransaction = Joi.object({
  body: Joi.object({
    protocol: Joi.string().valid(...allowedProtocols).required(),
    useTestnet: Joi.boolean().default(true),
    recipient: Joi.string().required(),
    amount: Joi.number().required()
    // fee: Joi.number().required()
  }).required(),
  headers: Joi.object({
    'x-wallet-id': Joi.string().required(),
    'x-account-id': Joi.number().default(0)
  }).unknown()
}).unknown()

exports.signTransaction = Joi.object({
  body: Joi.object({
    protocol: Joi.string().valid(...allowedProtocols).required(),
    useTestnet: Joi.boolean().default(true),
    unsignedTx: Joi.string().required()
  }).required(),
  headers: Joi.object({
    'x-wallet-id': Joi.string().required(),
    'x-account-id': Joi.number().default(0)
  }).unknown()
}).unknown()

exports.broadcastTransaction = Joi.object({
  body: Joi.object({
    protocol: Joi.string().valid(...allowedProtocols).required(),
    useTestnet: Joi.boolean().default(true),
    signedTx: Joi.string().required()
  }).required()
}).unknown()

exports.simpleSendTransaction = Joi.object({
  body: Joi.object({
    protocol: Joi.string().valid(...allowedProtocols).required(),
    useTestnet: Joi.boolean().default(true),
    recipient: Joi.string().required(),
    amount: Joi.number().required()
  }).required(),
  headers: Joi.object({
    'x-wallet-id': Joi.string().required(),
    'x-account-id': Joi.number().default(0)
  }).unknown()
}).unknown()
