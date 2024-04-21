const { generateMnemonic } = require('./infra/helpers/key-helper')

console.log({ mnemonic: generateMnemonic() })
