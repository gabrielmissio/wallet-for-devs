const { gzipSync } = require('zlib')

module.exports = class ExportAccountUseCase {
  constructor ({ keyRepository }) {
    this.keyRepository = keyRepository
    this.exportStrategy = QRCodeExportStrategy
  }

  async exportReadOnlyAccount ({ keyName, path }) {
    const { publicKey, ...custom } = this.keyRepository.exportReadOnlyKey({ keyName, path })

    return this.exportStrategy.exportAccount({ ...custom, publicKey, path })
  }
}

class QRCodeExportStrategy {
  static async exportAccount ({ publicKey, path, ...custom }) {
    const QRCodeData = {
      op: 'IMPORT',
      path,
      pubKey: publicKey,
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
