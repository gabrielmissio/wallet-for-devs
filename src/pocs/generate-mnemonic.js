const { generateMnemonic } = require('../core/src/infra/helpers/key-helper')

console.log({ mnemonic: generateMnemonic() })
