const defaultTimeout = 5000

module.exports = class HttpHelper {
  constructor ({ baseURL, globalTimeout = defaultTimeout } = {}) {
    this.baseURL = baseURL
    this.globalTimeout = globalTimeout
  }

  async fetch (url, { timeout, ...options } = {}, output) {
    const fetchUrl = this.baseURL ? `${this.baseURL}/${url}` : url
    const fetchTimeout = timeout || this.globalTimeout

    const { timeoutId, signal } = HttpHelper.setRequestTimeout(fetchTimeout)
    const config = { ...options, signal, timeoutId }

    return HttpHelper.internalFetch(fetchUrl, config, output)
  }

  static fetch = async (url, { timeout, ...options } = {}, output) => {
    const fetchTimeout = timeout || defaultTimeout

    const { timeoutId, signal } = HttpHelper.setRequestTimeout(fetchTimeout)
    const config = { ...options, signal, timeoutId }

    return HttpHelper.internalFetch(url, config, output)
  }

  static setRequestTimeout (timeout = defaultTimeout) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    return {
      timeoutId,
      signal: controller.signal
    }
  }

  static internalFetch = async (url, { timeoutId, ...config }, output = 'json') => {
    const data = await fetch(url, config)
    clearTimeout(timeoutId)

    let result
    try {
      result = await data.clone()[output]()
    } catch (error) {
      result = await data.text()
    }

    return result
  }
}
