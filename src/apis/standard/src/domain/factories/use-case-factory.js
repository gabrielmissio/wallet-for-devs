const BTCTestnetUseCasesComposer = require('../../main/composers/btc-use-case-composer')

// TODO: Create EVM use case composer to remove duplicated code
const BNBTestnetUseCasesComposer = require('../../main/composers/bnb-use-case-composer')
const ETHTestnetUseCasesComposer = require('../../main/composers/eth-use-case-composer')
const MATICTestnetUseCasesComposer = require('../../main/composers/matic-use-case-composer')

module.exports = class UseCaseFactory {
  static makeUseCase ({ useCase, protocol, useTestnet }) {
    let composer = null

    if (protocol === 'BTC_SEGWIT' && useTestnet) {
      composer = BTCTestnetUseCasesComposer
    } else if (protocol === 'BNB' && useTestnet) {
      composer = BNBTestnetUseCasesComposer
    } else if (protocol === 'ETH' && useTestnet) {
      composer = ETHTestnetUseCasesComposer
    } else if (protocol === 'MATIC' && useTestnet) {
      composer = MATICTestnetUseCasesComposer
    } else {
      throw new Error('Invalid protocol')
    }

    switch (useCase) {
      case 'account-balance':
        return composer.makeAccountBalanceUseCase()
      case 'account-discovery':
        return composer.makeAccountDiscoveryUseCase()
      case 'account-export':
        return composer.makeExportAccountUseCase()
      case 'address-discovery':
        return composer.makeAddressDiscoveryUseCase()
      case 'init-transaction':
        return composer.makeInitTxUseCase()
      case 'sign-transaction':
        return composer.makeSignTxUseCase()
      case 'broadcast-transaction':
        return composer.makeBroadcastTxUseCase()
      default:
        throw new Error('Invalid use case')
    }
  }
}
