const { gzipSync } = require('zlib')

module.exports = class SignTransactionUseCase {
  constructor ({ protocolStrategy }) {
    this.broadcastStrategy = QRCodeExportStrategy
    this.protocolStrategy = protocolStrategy
  }

  async signTransaction ({ keyName, path, payload }) {
    const { signedTx, publicKey, ...custom } = await this.protocolStrategy.signTransaction({ keyName, path, payload })

    return this.broadcastStrategy.broadcastTransaction({ signedTx, publicKey, path, ...custom })
  }
}

class QRCodeExportStrategy {
  static async broadcastTransaction ({ signedTx, publicKey, path, ...custom }) {
    const QRCodeData = {
      op: 'BROADCAST',
      path,
      signedTx,
      pubKey: publicKey,
      protocol: getProtocol(path),
      extended: true,
      ...custom
    }
    console.log({ QRCodeData })

    const QRCodeCompressed = gzipSync(
      Buffer.from(JSON.stringify(QRCodeData), 'utf-8')
    ).toString('base64')

    return {
      qrCodeData: `GZIP:${QRCodeCompressed}`
    }
  }
}

function getProtocol (path) {
  return path.split('/')[1] === "84'" ? 'btc_segwit' : 'btc'
}
